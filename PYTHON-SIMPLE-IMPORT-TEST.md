import json

# Simple import test for Python libraries
test_results = {
    "working": [],
    "failed": [],
    "total_tested": 0
}

# Test basic imports only
libraries_to_test = [
    "pandas", "numpy", "requests", "bs4", "lxml", "urllib3",
    "dateutil", "pytz", "pydantic", "yaml", "jinja2", "jwt",
    "openpyxl", "xlsxwriter", "PIL", "qrcode", "cv2", "scipy",
    "sympy", "matplotlib", "seaborn", "plotly", "nltk", "babel",
    "sqlalchemy", "pymongo", "sklearn", "transformers"
]

for lib_name in libraries_to_test:
    test_results["total_tested"] += 1
    try:
        __import__(lib_name)
        test_results["working"].append(lib_name)
    except ImportError as e:
        test_results["failed"].append(f"{lib_name}: {str(e)[:40]}")

test_results.update({
    "working_count": len(test_results["working"]),
    "failed_count": len(test_results["failed"]),
    "success_rate": f"{round((len(test_results['working']) / test_results['total_tested']) * 100)}%",
    "status": f"🎉 {len(test_results['working'])}/28 IMPORTS WORKING!" if len(test_results["failed"]) == 0 else f"⚠️ {len(test_results['failed'])}/28 import issues"
})

result = test_results
print(json.dumps(result))