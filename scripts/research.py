import urllib.request,json,pathlib
root=pathlib.Path('docs/sources');root.mkdir(parents=True,exist_ok=True)
repos=[('northgate-motors-demo','release/buyer-3-1',['docs/screenshots/home-1440.jpg','docs/screenshots/inventory-1440.jpg','docs/screenshots/studio-3d-1440.jpg']),('TennisScore','main',[]),('nova-scotia-grants-salesforce','main',['docs/screenshots/executive-dashboard.png','docs/screenshots/claim-processing.png']),('care-operations-analytics','main',['dashboard/screenshots/executive-overview.png','dashboard/screenshots/funding-health.png','dashboard/screenshots/tableau-executive-pulse.png']),('Gotcare-Ledger','main',[]),('salesforce-revops-demo','main',[]),('ai-engineering-journey','main',[]),('agentic-job-search-workflow','main',[])]
for repo,branch,images in repos:
 base=f'https://raw.githubusercontent.com/arjun2126/{repo}/{branch}/'
 try:
  text=urllib.request.urlopen(base+'README.md').read();(root/(repo+'.md')).write_bytes(text)
  print(repo, text.decode()[:1600] if repo not in [r[0] for r in repos[:4]] else 'README saved')
 except Exception as e:print(repo,e)
 for image in images:
   dest=pathlib.Path('.freebuff/image-sources')/repo/pathlib.Path(image).name;dest.parent.mkdir(parents=True,exist_ok=True)
  dest.write_bytes(urllib.request.urlopen(base+image).read())
 if repo=='TennisScore':
  tree=json.load(urllib.request.urlopen(f'https://api.github.com/repos/arjun2126/{repo}/git/trees/main?recursive=1'))
  print('Vantage image candidates:',[x['path'] for x in tree['tree'] if x['path'].lower().endswith(('.png','.jpg')) and 'assets' not in x['path'].lower()][:40])
