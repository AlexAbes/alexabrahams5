---
layout: post
title:  "How To Scrape Websites and Wrangle CSVs"
date:   2019-02-17 11:16:03
---

This post is intended as a worksheet for the in-person workshops I do on how to scape data from websites and wrangle it into a CSV. This kind of assumes you're using a Mac.

#### Assumed knowledge:
* Understanding of HTML and basic website structure
* Basics of Python (v2 or v3) syntax: assigning variables, print to the console, conditionals, functions, lists, dictionaries, and loops. All of these are covered [here](https://www.codecademy.com/learn/learn-python) in sections 1 through 8 if you need a refresher.
* Assumes a code editor like Sublime Text is already installed.

#### Prep work before session:
* All Macs come with Python 2.7 installed, but if you've done any Python before you may installed a newer version like Python 3. That's totally fine- you can do web scraping in either version, but the commands may be slightly different. You can check which version you have by opening a Terminal window (if you have a Mac, otherwise it's a different application) and running the following command:
```python
python --version
```
* Python comes with a lot of modules already installed, but not all of the ones you'll need today. We need to install the [requests](http://docs.python-requests.org/en/master/) module, which lets your program visit websites, and the [BeautifulSoup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/) module, which parses the HTML you get from a website and makes it easy to pull out the tags you're looking for. You also need to install the [csv](https://docs.python.org/3/library/csv.html) module, which lets you create and manipulate CSVs. To install these modules, run the following commands one at a time in your Terminal window:
```
pip install requests
pip install beautifulsoup4
pip install csv
```

If you have any problems with the above, contact me and we'll sort it out before the workshop.

OK, let's get scraping!

#### Visiting a website
Create a new file in Sublime Text and paste in the following code:
```python
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
```

Save the file in your Documents folder and call it 'scraper.py'. To run this file, you need to navigate to where the file lives and then run it.
1. Open a Terminal window.
2. You're going to navigate from where Terminal starts you by default to where your new Python file lives. If you're using a Mac and you saved the file directly into the Documents folder (not in a subfolder) then the following command should work:
```
cd Documents
```
The above command tells your computer to change your directory to the Documents folder. Running commands like this is called using the command line.
3. Let's now run our Python file.
```
python scraper.py
```

A lot of HTML should have just been printed on your screen. If you got an error, pause and ask for help. The HTML corresponds to the HTML of the website at the URL you supplied to your program.

#### Scraping the data from a website
Now that we seem to have the HTML from a website down, we probably want to look at a particular part of it. We can go to the website and use the inspector to take a look at the code for the part that we are interested in, the table of polls:
```html
<table class="data large ">
    <!-- stuff we want appears in this element -->
</table>
```
So it appears that we just want to pull out this element. Let's do that using BeautifulSoup's find_all function:
```python
rcp_tables_list = soup.find_all("table", class_="data large ")
if len(rcp_tables_list) > 0:
	print(rcp_tables_list[0])
```
You can use the find method instead of the find_all method, but I prefer the find_all method because it is easier for me to check if anything at all was found before I proceed. It returns a list, which is why we need to index into it for the 0th element.

We're interested in the rows of this table. Let's save a list of all the tr elements into a variable:

```python
# Get a list of the table row elements in the first table of the tables list
table_rows = rcp_tables_list[0].find_all("tr")
```

So now we have the table rows in a Python variable, but that isn't very helpful to us for viewing it in a table-friendly format. Often you'll want to do something to the data before you save it to your computer, but let's imagine that for now you just wanted to save these table rows as a table in a CSV.

#### Turning the data into a CSV

Python's CSV module treats a CSV as a list of lists. Each element of the list is a row, which is represented in Python as a list. For example, the following table:
<table class="table table-bordered">
    <thead class="thead-dark">
        <tr>
            <th scope="col">Column 1</th>
            <th scope="col">Column 2</th>
            <th scope="col">Column 3</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Data for row 1 in col 1</td>
            <td>Data for row 1 in col 2</td>
            <td>Data for row 1 in col 3</td>
        </tr>
        <tr>
            <td>Data for row 2 in col 1</td>
            <td>Data for row 2 in col 2</td>
            <td>Data for row 2 in col 3</td>
        </tr>
    </tbody>
</table>

Would be represented in Python for a CSV as:
```python
list_of_rows = [
	['Column 1', 'Column 2', 'Column 3'],
	['Data for row 1 in col 1', 'Data for row 1 in col 2', 'Data for row 1 in col 3'],
	['Data for row 2 in col 1', 'Data for row 2 in col 2', 'Data for row 2 in col 3']
]
```

So let's set about turning our list of table rows into a list of lists so that we can save it as a CSV.

```python
# List_of_rows will contain our CSV
list_of_rows = []
# Need to get the header separately, because it contains th cells not td cells
header = []
# Loop over the table head row and get the text in each th element, saving it to the header
for cell in table_rows[0].find_all("th"):
	header.append(cell.text)
# Put the header into our CSV variable
list_of_rows.append(header)
# Loop over the rest of the table rows, excluding the first one
for row in table_rows[1:]:
	csv_row = []
	for cell in row.find_all("td"):
		csv_row.append(cell.text)
	list_of_rows.append(csv_row)
```

Now ```list_of_rows``` should contain a list of lists, where each list represents a row in the table from the website. Let's save this as a CSV:

```python
outfile = open("biden_v_trump.csv", "w")
writer = csv.writer(outfile)
writer.writerows(list_of_rows)
```

A file called 'biden_v_trump.csv' should have just appeared in your Documents folder. Open it in Excel and check it out. Congrats, you just scraped a website and saved the results in a CSV!

Final code for 'scraper.py' can be downloaded <a href="http://alexandraabrahams.com/scraping/scraper.py">here</a>. A more advanced version for scraping multiple similar RCP pages can be found <a href="http://alexandraabrahams.com/scraping/scrape_more.py">here</a>.

Other topics of interest:
* Using a headless browser to visit websites in a more human way: check out [Splinter](https://splinter.readthedocs.io/en/latest/index.html) for an example of a headless browser in Python.
* You might want to save these results to a Google spreadsheet instead of a CSV on your computer. For that, try this Python wrapper for the Google Drive API called [gspread](https://gspread.readthedocs.io/en/latest/index.html).



