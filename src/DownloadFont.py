from os.path import join
from requests import get

def download_google_font(font_family, save_path):
    api_url = f"https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAJdTwUo_TlXScWM2cUGi5ik1qY77s39-4"
    response = get(api_url)
    data = response.json()

    for font in data['items']:
        if font['family'] == font_family:
            for variant, file_url in font['files'].items():
                file_extension = file_url.split('.')[-1]
                file_name = f"{font_family.replace(' ', '')}{variant.capitalize()}.{file_extension}"
                download_url(file_url, join(save_path, file_name))

def download_url(url, save_path):
    response = get(url)
    with open(save_path, 'wb') as file:
        file.write(response.content)
