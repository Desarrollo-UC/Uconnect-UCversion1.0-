from django.http import HttpResponseForbidden
import ipaddress
import traceback
import sys

ALLOWED_IP_RANGES = ['127.0.0.1', '192.168.8.0/22','10.200.0.0/16']

def ip_in_allowed_ranges(ip, allowed_ranges):
    ip_obj = ipaddress.ip_address(ip)
    for range in allowed_ranges:
        if ip_obj in ipaddress.ip_network(range):
            return True
    return False

class ErrorTracebackMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        request.traceback = ''.join(
            traceback.format_exception(
                type(exception),
                exception,
                exception.__traceback__
            )
        )
        return None  # MUY IMPORTANTE: volver a lanzar el error



class RestrictIPMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        if 'HTTP_X_FORWARDED_FOR' in request.META:
            ip = request.META['HTTP_X_FORWARDED_FOR'].split(',')[0]

        if request.path.startswith('/api/'):
            if not ip_in_allowed_ranges(ip, ALLOWED_IP_RANGES):
                return HttpResponseForbidden("Forbidden: IP address not allowed.")
        response = self.get_response(request)
        return response