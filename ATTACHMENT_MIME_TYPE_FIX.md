# Attachment MIME Type Fix

## Issue
Error when displaying attachments with undefined `mime_type`:
```
ERROR TypeError: Cannot read properties of undefined (reading 'startsWith')
```

The API sometimes returns attachments without the `mime_type` field, causing the attachment viewer to crash.

## Root Cause
1. **Attachment model** defined `mime_type` as required field
2. **Service helper methods** didn't handle undefined/null values
3. **Component** assumed mime_type always exists

## Solution

### 1. Made mime_type Optional in Model
**File:** `src/app/core/models/ticket.model.ts`

```typescript
export interface Attachment {
  id: number;
  filename: string;
  original_name: string;
  name: string;
  mime_type?: string;  // ✅ Now optional
  size: number;
  url: string;
  created_at: string;
}
```

### 2. Updated Service Helper Methods
**File:** `src/app/core/services/ticket.service.ts`

Added null-safety checks:

```typescript
isImageAttachment(mimeType: string | undefined): boolean {
  return mimeType ? mimeType.startsWith('image/') : false;
}

isPdfAttachment(mimeType: string | undefined): boolean {
  return mimeType === 'application/pdf';
}

canViewInBrowser(mimeType: string | undefined): boolean {
  if (!mimeType) return false;
  return this.isImageAttachment(mimeType) || 
         this.isPdfAttachment(mimeType) ||
         mimeType.startsWith('text/') ||
         mimeType === 'application/json';
}
```

### 3. Added MIME Type Fallback in Component
**File:** `src/app/shared/components/attachment-viewer/attachment-viewer.component.ts`

Created helper method to guess MIME type from filename extension:

```typescript
getMimeType(attachment: Attachment): string {
  if (attachment.mime_type) {
    return attachment.mime_type;
  }
  
  // Fallback: guess from filename extension
  const filename = attachment.original_name || attachment.name || '';
  const ext = filename.split('.').pop()?.toLowerCase();
  
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'png':
      return 'image/png';
    case 'gif':
      return 'image/gif';
    case 'svg':
      return 'image/svg+xml';
    case 'pdf':
      return 'application/pdf';
    case 'doc':
    case 'docx':
      return 'application/msword';
    case 'xls':
    case 'xlsx':
      return 'application/vnd.ms-excel';
    case 'zip':
      return 'application/zip';
    case 'txt':
      return 'text/plain';
    default:
      return 'application/octet-stream';
  }
}
```

### 4. Updated Template to Use Helper
```typescript
// Before
@if (isImage(attachment.mime_type)) { }

// After
@if (isImage(getMimeType(attachment))) { }
```

## Supported File Extensions (Fallback)

When `mime_type` is missing, the component can identify:

### Images
- `.jpg`, `.jpeg` → image/jpeg
- `.png` → image/png
- `.gif` → image/gif
- `.svg` → image/svg+xml

### Documents
- `.pdf` → application/pdf
- `.doc`, `.docx` → application/msword
- `.xls`, `.xlsx` → application/vnd.ms-excel
- `.txt` → text/plain

### Archives
- `.zip` → application/zip

### Default
- Unknown extensions → application/octet-stream

## Benefits

✅ **No more crashes** - Handles missing mime_type gracefully  
✅ **Fallback detection** - Guesses type from file extension  
✅ **Better icons** - Shows correct icon based on file type  
✅ **View/Download** - Works even without mime_type  
✅ **Backward compatible** - Still uses mime_type when available  

## Testing

### Test Cases
1. ✅ Attachment with `mime_type` → Uses API value
2. ✅ Attachment without `mime_type` → Guesses from extension
3. ✅ Unknown extension → Shows generic file icon
4. ✅ View button → Only appears for viewable types
5. ✅ Download → Always works regardless of type

### Example Data

**With mime_type:**
```json
{
  "id": 1,
  "original_name": "report.pdf",
  "mime_type": "application/pdf",
  "size": 102400,
  "url": "..."
}
```

**Without mime_type (will guess):**
```json
{
  "id": 2,
  "original_name": "screenshot.png",
  "mime_type": null,
  "size": 51200,
  "url": "..."
}
```

## Files Modified

1. `src/app/core/models/ticket.model.ts` - Made mime_type optional
2. `src/app/core/services/ticket.service.ts` - Added null-safety
3. `src/app/shared/components/attachment-viewer/attachment-viewer.component.ts` - Added fallback logic

## Date
January 13, 2025
