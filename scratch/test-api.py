import requests
import json

def test():
    urls = [
        'https://techtopiagh-crm.onrender.com/openapi/v1.json',
        'https://techtopiagh-crm.onrender.com/swagger/v1/swagger.json'
    ]
    for url in urls:
        try:
            res = requests.get(url)
            print(f'URL: {url} status: {res.status_code}')
            if res.status_code == 200:
                data = res.json()
                print('Paths in OpenAPI:')
                paths = sorted(data.get('paths', {}).keys())
                for path in paths:
                    print(f'  {path}')
                # Also save the JSON for detailed review
                with open('scratch/openapi.json', 'w') as f:
                    json.dump(data, f, indent=2)
                print('Saved openapi.json to scratch/openapi.json')
                break
        except Exception as e:
            print('Error fetching:', url, e)

if __name__ == '__main__':
    test()
