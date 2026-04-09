import requests
import json

r = requests.get('http://127.0.0.1:8000/production/district')
data = r.json()
print(f'Total districts: {len(data)}')
for d in data:
    print(f'  {d["district"]}: {d["production"]} quintals')
