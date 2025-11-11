# import requests

# url = "https://pinterest-scraper5.p.rapidapi.com/search"
# querystring = {"username": "eilohie"} 


# headers = {
# 	"x-rapidapi-key": "7665b4ccf9mshb40851f7d52bbbfp104dddjsn2135812d2823",
# 	"x-rapidapi-host": "pinterest-scraper5.p.rapidapi.com"
# }

# response = requests.get(url, headers=headers, params=querystring)
# def pinterest():
#     swish = response.json()
#     users = swish['data']['users']
#     behance = []
#     behance_imgs = []
#     for swish_data in users:
#         behance.append({
#             'Username': {swish_data['username']},
#             'image': {swish_data['image_large_url']},
#             'Full_name': {swish_data['full_name']},
#             'Followers': {swish_data['follower_count']}
#         })
        

#         for img in swish_data["recent_pin_images"]["192x"]:
#             behance_imgs.append({
#                 img["url"]
#             })
#     return behance, behance_imgs
            





# # print(swish['data']['users'][0]['recent_pin_images']['192x'][0])



# import requests
# import random

# url = "https://real-time-image-search.p.rapidapi.com/search"
# queries = ['Art', 'Design', 'Illustration', 'Baking', 'Wallpainting', 'VFX', 'Anime', 'Manga', '3D', 'Photography', 'Pixel']

# headers = {
#     "x-rapidapi-key": "7665b4ccf9mshb40851f7d52bbbfp104dddjsn2135812d2823",
#     "x-rapidapi-host": "real-time-image-search.p.rapidapi.com"
# }

# images = []

# for q in queries:
#     querystring = {
#         "query": q,
#         "limit": "1",  # just one image per category for now
#         "size": "any",
#         "color": "any",
#         "type": "any",
#         "time": "any",
#         "usage_rights": "any",
#         "file_type": "any",
#         "aspect_ratio": "any",
#         "safe_search": "off",
#         "region": "us"
#     }

#     try:
#         response = requests.get(url, headers=headers, params=querystring)
#         result = response.json()

#         # if data found, take the first image
#         if 'data' in result and result['data']:
#             r = result['data'][0]
#             images.append({
#                 'query': q,
#                 'title': r.get('title'),
#                 'image': r.get('url'),
#                 'source': r.get('source')
#             })
#     except Exception as e:
#         print(f"Error fetching {q}: {e}")

# print(images)

    
# import requests

# url = "https://real-time-image-search.p.rapidapi.com/search"
# queries = ['Art', 'Design', 'Illustration', 'Baking', 'Wallpainting', 'VFX', 'Anime', 'Manga', '3D', 'Photography', 'Pixel']

# headers = {
#     "x-rapidapi-key": "7665b4ccf9mshb40851f7d52bbbfp104dddjsn2135812d2823",
#     "x-rapidapi-host": "real-time-image-search.p.rapidapi.com"
# }

# images = []

# for q in queries:
#     querystring = {
#         "query": q,
#         "limit": "1",
#         "size": "any",
#         "color": "any",
#         "type": "any",
#         "time": "any",
#         "usage_rights": "any",
#         "file_type": "any",
#         "aspect_ratio": "any",
#         "safe_search": "off",
#         "region": "us"
#     }

#     print(f"\nFetching: {q}")
    
#     try:
#         response = requests.get(url, headers=headers, params=querystring)
#         print(f"Status code: {response.status_code}")
#         print(f"Response text: {response.text[:500]}")  # First 500 chars
        
#         result = response.json()
#         print(f"JSON keys: {result.keys() if isinstance(result, dict) else 'Not a dict'}")
        
#         if 'data' in result and result['data']:
#             r = result['data'][0]
#             images.append({
#                 'query': q,
#                 'title': r.get('title'),
#                 'image': r.get('url'),
#                 'source': r.get('source')
#             })
#             print("✓ Image added")
#         else:
#             print(f"✗ No data. Full response: {result}")
            
#     except Exception as e:
#         print(f"✗ Exception: {type(e).__name__}: {str(e)}")
#         import traceback
#         traceback.print_exc()

# print(f"\n=== Final count: {len(images)} images ===")
# print(images)

import requests

# # Get free API key from https://unsplash.com/developers
# ACCESS_KEY = "your_unsplash_access_key"

# queries = ['Art', 'Design', 'Illustration', 'Baking']
# images = []

# for q in queries:
#     url = f"https://api.unsplash.com/search/photos"
#     params = {
#         "query": q,
#         "per_page": 1,
#         "client_id": ACCESS_KEY
#     }
    
#     response = requests.get(url, params=params)
#     if response.status_code == 200:
#         data = response.json()
#         if data['results']:
#             img = data['results'][0]
#             images.append({
#                 'query': q,
#                 'title': img.get('description') or img.get('alt_description'),
#                 'image': img['urls']['regular'],
#                 'source': img['links']['html']
#             })

# print(images)