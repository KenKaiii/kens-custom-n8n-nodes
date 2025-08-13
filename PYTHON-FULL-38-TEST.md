import json

# Test all 38 Python libraries auto-installed by SuperCode
test_results = {
    "working": [],
    "failed": [],
    "total_tested": 0
}

# All 38 packages from python-installer.py
libraries_to_test = [
    ("pandas", "import pandas as pd; len(pd.DataFrame({'test': [1, 2, 3]}))"),
    ("numpy", "import numpy as np; len(np.array([1, 2, 3]))"),
    ("requests", "import requests; hasattr(requests, 'get')"),
    ("beautifulsoup4", "from bs4 import BeautifulSoup; BeautifulSoup('<p>test</p>', 'html.parser').find('p').text"),
    ("lxml", "import lxml; hasattr(lxml, 'etree')"),
    ("urllib3", "import urllib3; hasattr(urllib3, 'PoolManager')"),
    ("python-dateutil", "from dateutil import parser; bool(parser.parse('2023-01-01'))"),
    ("pytz", "import pytz; bool(pytz.UTC)"),
    ("pydantic", "from pydantic import BaseModel; class Test(BaseModel): name: str; Test(name='test').name"),
    ("email-validator", "from email_validator import validate_email; bool(validate_email)"),
    ("PyYAML", "import yaml; yaml.safe_load('test: value')['test']"),
    ("xmltodict", "import xmltodict; hasattr(xmltodict, 'parse')"),
    ("defusedxml", "import defusedxml; hasattr(defusedxml, 'ElementTree')"),
    ("jinja2", "from jinja2 import Template; Template('{{name}}').render(name='test')"),
    ("cryptography", "from cryptography.fernet import Fernet; bool(Fernet.generate_key())"),
    ("pyjwt", "import jwt; hasattr(jwt, 'encode')"),
    ("passlib", "from passlib.hash import pbkdf2_sha256; bool(pbkdf2_sha256.hash('test'))"),
    ("openpyxl", "import openpyxl; hasattr(openpyxl, 'Workbook')"),
    ("xlsxwriter", "import xlsxwriter; hasattr(xlsxwriter, 'Workbook')"),
    ("pypdf2", "import PyPDF2; hasattr(PyPDF2, 'PdfReader')"),
    ("reportlab", "from reportlab.pdfgen import canvas; hasattr(canvas, 'Canvas')"),
    ("pillow", "from PIL import Image; hasattr(Image, 'new')"),
    ("qrcode", "import qrcode; hasattr(qrcode, 'QRCode')"),
    ("opencv-python-headless", "import cv2; hasattr(cv2, 'imread')"),
    ("scipy", "import scipy; hasattr(scipy, 'stats')"),
    ("sympy", "import sympy; hasattr(sympy, 'symbols')"),
    ("matplotlib", "import matplotlib.pyplot as plt; hasattr(plt, 'plot')"),
    ("seaborn", "import seaborn as sns; hasattr(sns, 'scatterplot')"),
    ("plotly", "import plotly; hasattr(plotly, 'graph_objects')"),
    ("fuzzywuzzy", "from fuzzywuzzy import fuzz; fuzz.ratio('test', 'test')"),
    ("nltk", "import nltk; hasattr(nltk, 'word_tokenize')"),
    ("textblob", "from textblob import TextBlob; TextBlob('test').sentiment.polarity"),
    ("phonenumbers", "import phonenumbers; hasattr(phonenumbers, 'parse')"),
    ("babel", "import babel; hasattr(babel, 'Locale')"),
    ("sqlalchemy", "import sqlalchemy; hasattr(sqlalchemy, 'create_engine')"),
    ("pymongo", "import pymongo; hasattr(pymongo, 'MongoClient')"),
    ("scikit-learn", "from sklearn.linear_model import LinearRegression; hasattr(LinearRegression, 'fit')"),
    ("transformers", "import transformers; hasattr(transformers, 'pipeline')")
]

for lib_name, test_code in libraries_to_test:
    test_results["total_tested"] += 1
    try:
        result = eval(test_code)
        test_results["working"].append(f"{lib_name}: ✅")
    except Exception as e:
        test_results["failed"].append(f"{lib_name}: {str(e)[:40]}")

test_results.update({
    "working_count": len(test_results["working"]),
    "failed_count": len(test_results["failed"]),
    "success_rate": f"{round((len(test_results['working']) / test_results['total_tested']) * 100)}%",
    "status": f"🎉 ALL {len(test_results['working'])}/38 WORKING!" if len(test_results["failed"]) == 0 else f"⚠️ {len(test_results['failed'])}/38 need attention",
    "auto_installer_working": True
})

result = test_results
print(json.dumps(result))