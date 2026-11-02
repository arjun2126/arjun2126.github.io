import { ArrowUpRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { projects, projectBySlug } from '../content/projects';
import { allSkills, skillGroups } from '../content/profile';
import { AppLink } from '../lib/navigation';

export function SkillsExplorer({ mode = 'window' }: { mode?: 'window' | 'document' }) {
  const [groupId, setGroupId] = useState(skillGroups[0].id);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<string | null>(skillGroups[0].skills[0].name);

  const group = skillGroups.find((entry) => entry.id === groupId) ?? skillGroups[0];
  const searching = query.trim().length > 0;

  const visibleSkills = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allSkills.filter((skill) => {
      if (!searching && skill.groupId !== group.id) return false;
      if (!term) return true;
      return (
        skill.name.toLowerCase().includes(term) ||
        skill.note.toLowerCase().includes(term) ||
        skill.group.toLowerCase().includes(term)
      );
    });
  }, [group.id, query, searching]);

  const selectedSkill = visibleSkills.find((skill) => skill.name === selected) ?? null;
  const selectedProjects = selectedSkill
    ? selectedSkill.projects.map((slug) => projectBySlug[slug]).filter(Boolean)
    : [];

  return (
    <div className={`skills-content skills-content--${mode}`}>
      <header className="skills-header">
        <div>
          <span className="eyebrow">Technical skills explorer</span>
          <h1>The toolkit.</h1>
          <p>
            Every capability below is tied to a project that uses it. There are no proficiency
            percentages here — just the work and the public source behind it.
          </p>
        </div>
        <dl className="skills-stats">
          <div>
            <dt>Skills</dt>
            <dd>{allSkills.length}</dd>
          </div>
          <div>
            <dt>Projects</dt>
            <dd>{projects.length}</dd>
          </div>
          <div>
            <dt>Disciplines</dt>
            <dd>{skillGroups.length}</dd>
          </div>
        </dl>
      </header>

      <div className="skills-search">
        <Search size={17} aria-hidden="true" />
        <label className="sr-only" htmlFor="skill-search">
          Search skills
        </label>
        <input
          id="skill-search"
          type="search"
          value={query}
          placeholder="Search the toolkit (Apex, Swift, risk model…)"
          onChange={(event) => setQuery(event.target.value)}
        />
        {query ? (
          <button type="button" onClick={() => setQuery('')} aria-label="Clear skills search">
            Clear
          </button>
        ) : null}
      </div>

      <div className="skills-layout">
        <div className="skills-nav">
          <div className="skills-tabs" role="group" aria-label="Skill disciplines">
            {skillGroups.map((entry) => (
              <button
                key={entry.id}
                type="button"
                aria-pressed={!searching && entry.id === groupId}
                className={!searching && entry.id === groupId ? 'is-active' : ''}
                onClick={() => {
                  setQuery('');
                  setGroupId(entry.id);
                  setSelected(entry.skills[0].name);
                }}
              >
                <span>{entry.label}</span>
                <span className="skills-tabs__count">{entry.skills.length}</span>
              </button>
            ))}
          </div>
          <p className="skills-nav__note">{searching ? 'Searching all disciplines.' : group.description}</p>
        </div>

        <div className="skills-panel">
          <div className="skills-panel__head">
            <h2>{searching ? 'Search results' : group.label}</h2>
            <span>{visibleSkills.length} skills</span>
          </div>
          {visibleSkills.length > 0 ? (
            <div className="skill-grid" role="group" aria-label="Skills">
              {visibleSkills.map((skill) => (
                <button
                  key={`${skill.groupId}-${skill.name}`}
                  type="button"
                  aria-pressed={selectedSkill?.name === skill.name}
                  className={`skill-chip${selectedSkill?.name === skill.name ? ' is-active' : ''}`}
                  onClick={() => setSelected(skill.name)}
                >
                  {skill.name}
                  {searching ? <span>{skill.group}</span> : null}
                </button>
              ))}
            </div>
          ) : (
            <div className="skills-empty">
              <p>No skills match “{query.trim()}”.</p>
              <button type="button" className="text-button" onClick={() => setQuery('')}>
                Clear search
              </button>
            </div>
          )}

          {selectedSkill ? (
            <div className="skill-detail" aria-live="polite">
              <div className="skill-detail__copy">
                <span className="eyebrow">Selected skill</span>
                <h3>{selectedSkill.name}</h3>
                <p>{selectedSkill.note}</p>
              </div>
              <div className="skill-detail__projects">
                <span className="skill-detail__label">Used in</span>
                {selectedProjects.map((project) => (
                  <AppLink href={`/projects/${project.slug}/`} key={project.slug} className="skill-project">
                    <span className="skill-project__dot" style={{ background: project.accent }} aria-hidden="true" />
                    <span>{project.name}</span>
                    <ArrowUpRight size={13} aria-hidden="true" />
                  </AppLink>
                ))}
              </div>
            </div>
          ) : (
            <div className="skill-detail skill-detail--empty">
              <p>Choose a skill to see the projects where it is used.</p>
            </div>
          )}
        </div>
      </div>

      <footer className="skills-footer">
        <p>
          Skills are derived from the implementation described in each public repository. No
          certifications, years of experience or proficiency ratings are implied.
        </p>
        <AppLink href="/resume/" className="text-link">
          Open the evidence-based résumé
          <span aria-hidden="true">→</span>
        </AppLink>
      </footer>
    </div>
  );
}
