import { Component, Input, forwardRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FilePondModule } from 'ngx-filepond';
import * as FilePond from 'filepond';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';

// Register plugins
FilePond.registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImagePreview
);

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, FilePondModule],
  template: `
    <div class="file-upload-wrapper">
      <file-pond
        #myPond
        [options]="pondOptions"
        (oninit)="handleInit()"
        (onaddfile)="handleAddFile($event)"
        (onremovefile)="handleRemoveFile($event)"
      ></file-pond>
    </div>
  `,
  styles: [`
    .file-upload-wrapper {
      width: 100%;
    }
    
    :host ::ng-deep .filepond--root {
      margin-bottom: 0;
    }
    
    :host ::ng-deep .filepond--drop-label {
      min-height: 100px;
    }
  `],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ]
})
export class FileUploadComponent implements ControlValueAccessor, OnInit {
  @Input() maxFiles = 5;
  @Input() maxFileSize = '10MB';
  @Input() acceptedFileTypes: string[] = [];
  @Input() allowMultiple = true;

  pondOptions: any = {};
  
  private files: File[] = [];
  private onChange: (files: File[]) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    this.pondOptions = {
      allowMultiple: this.allowMultiple,
      maxFiles: this.maxFiles,
      maxFileSize: this.maxFileSize,
      labelIdle: 'Drag & Drop your files or <span class="filepond--label-action">Browse</span>',
      acceptedFileTypes: this.acceptedFileTypes.length > 0 ? this.acceptedFileTypes : undefined,
      credits: false,
      stylePanelLayout: 'compact',
      styleLoadIndicatorPosition: 'center bottom',
      styleButtonRemoveItemPosition: 'right',
      styleButtonProcessItemPosition: 'right'
    };
  }

  handleInit(): void {
    console.log('✅ [FILE UPLOAD] FilePond initialized');
  }

  handleAddFile(event: any): void {
    const file = event.file.file as File;
    console.log('📎 [FILE UPLOAD] File added:', file.name, `(${file.size} bytes)`);
    this.files.push(file);
    this.onChange(this.files);
    this.onTouched();
  }

  handleRemoveFile(event: any): void {
    const file = event.file.file as File;
    console.log('🗑️ [FILE UPLOAD] File removed:', file.name);
    this.files = this.files.filter(f => f !== file);
    this.onChange(this.files);
  }

  writeValue(value: File[] | null): void {
    this.files = value || [];
  }

  registerOnChange(fn: (files: File[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.pondOptions = {
      ...this.pondOptions,
      disabled: isDisabled
    };
  }
}
