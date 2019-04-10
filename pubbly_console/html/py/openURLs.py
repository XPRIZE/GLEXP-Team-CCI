import webbrowser
urls = []

with open("urls.txt") as file:
    data = file.read().splitlines()

for d in data:
    webbrowser.open_new_tab(d)