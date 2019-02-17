import csv
from bs4 import BeautifulSoup
import requests

# Assign the website address you want to visit to the variable called 'url'
url = "https://www.realclearpolitics.com/epolls/2020/president/us/general_election_trump_vs_biden-6247.html"
# Use the requests module to 'get' the website at this link
response = requests.get(url)
# Get the content from the website's response
html = response.content
# Parse this content using BeautifulSoup's html parser
soup = BeautifulSoup(html, "html.parser")
# Let's see what we got!
print(soup)

# List_of_rows will contain our CSV
list_of_rows = []
# Get a list of the tables that have the same class as the table we want
rcp_tables_list = soup.find_all("table", class_="data large ")
# Get a list of the table row elements in the first table of the above list
table_rows = rcp_tables_list[0].find_all("tr")
# Need to get the header separately, because it contains th cells not td cells
header = []
for cell in table_rows[0].find_all("th"):
	header.append(cell.text)
# Put the header into our CSV
list_of_rows.append(header)
# Loop over the rest of the table rows, excluding the first one
for row in table_rows[1:]:
	csv_row = []
	for cell in row.find_all("td"):
		csv_row.append(cell.text)
	list_of_rows.append(csv_row)

outfile = open("biden_v_trump.csv", "w")
writer = csv.writer(outfile)
writer.writerows(list_of_rows)