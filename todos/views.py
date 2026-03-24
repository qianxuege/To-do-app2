from django.shortcuts import render


def index(request):
    # Frontend handles auth via token; this page just renders the UI shell.
    return render(request, "index.html")
