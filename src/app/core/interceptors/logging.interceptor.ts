import { HttpInterceptorFn } from '@angular/common/http';
import { tap, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  if (environment.production && environment.logLevel !== 'debug') {
    return next(req);
  }

  const started = Date.now();
  
  // Log request details
  console.group(`🚀 HTTP Request: ${req.method} ${req.url}`);
  
  // Log headers
  const headerKeys = req.headers.keys();
  if (headerKeys.length > 0) {
    console.log('📋 Headers:');
    headerKeys.forEach(key => {
      const value = req.headers.get(key);
      // Mask sensitive values
      if (key.toLowerCase() === 'authorization') {
        console.log(`  ${key}: Bearer ***${value?.slice(-8) || ''}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
  } else {
    console.log('📋 Headers: (none explicitly set, browser will add defaults)');
  }
  
  // Log body details
  if (req.body) {
    if (req.body instanceof FormData) {
      console.log('📦 Body Type: FormData (multipart/form-data)');
      console.log('📦 FormData entries:');
      let entryCount = 0;
      req.body.forEach((value, key) => {
        entryCount++;
        if (value instanceof File) {
          console.log(`  ✓ ${key}: [File] ${value.name} (${value.size} bytes, type: ${value.type || 'unknown'})`);
        } else {
          console.log(`  ✓ ${key}: "${value}"`);
        }
      });
      console.log(`📊 Total entries: ${entryCount}`);
    } else {
      console.log('📦 Body Type:', typeof req.body);
      console.log('📦 Body:', req.body);
    }
  } else {
    console.log('📦 Body: (empty)');
  }
  console.groupEnd();

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type === 4) { // HttpResponse type
          const elapsed = Date.now() - started;
          console.group(`✅ HTTP Response: ${req.method} ${req.url} (${elapsed}ms)`);
          console.log('Status:', (event as any).status);
          console.log('Response:', (event as any).body);
          console.groupEnd();
        }
      },
      error: (error) => {
        const elapsed = Date.now() - started;
        console.group(`❌ HTTP Error: ${req.method} ${req.url} (${elapsed}ms)`);
        console.error('Status:', error.status);
        console.error('Status Text:', error.statusText);
        
        if (error.error) {
          console.error('Error Response Body:', error.error);
          
          // Log specific error details if available
          if (error.error.message) {
            console.error('Backend Error Message:', error.error.message);
          }
          if (error.error.exception) {
            console.error('Backend Exception:', error.error.exception);
          }
          if (error.error.file) {
            console.error('Backend Error File:', error.error.file, 'Line:', error.error.line);
          }
          if (error.error.trace) {
            console.error('Backend Stack Trace:', error.error.trace);
          }
        }
        
        console.error('Frontend Error Message:', error.message);
        console.error('Full Error Object:', error);
        console.groupEnd();
      }
    })
  );
};
