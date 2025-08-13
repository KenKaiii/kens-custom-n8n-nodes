import json

# Test Python libraries auto-installed by SuperCode
test_results = {
    "working": [],
    "failed": [],
    "total_tested": 0
}

libraries_to_test = [
    ("pandas", "import pandas as pd; df = pd.DataFrame({'test': [1, 2, 3]}); len(df)"),
    ("numpy", "import numpy as np; arr = np.array([1, 2, 3]); len(arr)"),
    ("requests", "import requests; hasattr(requests, 'get')"),
    ("beautifulsoup4", "from bs4 import BeautifulSoup; BeautifulSoup('<p>test</p>', 'html.parser').find('p').text"),
    ("PyYAML", "import yaml; yaml.safe_load('test: value')['test']"),
    ("pydantic", "from pydantic import BaseModel; class Test(BaseModel): name: str; Test(name='test').name"),
    ("cryptography", "from cryptography.fernet import Fernet; bool(Fernet.generate_key())"),
    ("pillow", "from PIL import Image; hasattr(Image, 'new')"),
    ("qrcode", "import qrcode; hasattr(qrcode, 'QRCode')"),
    ("matplotlib", "import matplotlib; hasattr(matplotlib, 'pyplot')")
]

for lib_name, test_code in libraries_to_test:
    test_results["total_tested"] += 1
    try:
        result = eval(test_code)
        test_results["working"].append(f"{lib_name}: {result}")
    except Exception as e:
        test_results["failed"].append(f"{lib_name}: {str(e)[:50]}")

test_results.update({
    "working_count": len(test_results["working"]),
    "failed_count": len(test_results["failed"]),
    "success_rate": f"{round((len(test_results['working']) / test_results['total_tested']) * 100)}%",
    "status": "SUCCESS!" if len(test_results["failed"]) == 0 else f"{len(test_results['failed'])} libraries need attention"
})

result = test_results
print(json.dumps(result))