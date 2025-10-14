import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketCategoryService } from '../../../../core/services/ticket-category.service';
import { HeaderComponent } from '../../../../shared/components/header/header.component';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TicketCategory } from '../../../../core/models/ticket.model';

@Component({
  selector: 'app-ticket-categories-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HeaderComponent,
    TranslatePipe
  ],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>

      <main class="max-w-7xl mx-auto px-4 py-8">
        <!-- Page Header -->
        <div class="mb-6">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-3xl font-heading font-bold text-gray-900">{{ 'admin.ticketCategories' | translate }}</h2>
              <p class="text-gray-600 mt-1">{{ 'admin.manageCategoriesDescription' | translate }}</p>
            </div>
            <button 
              (click)="showCreateModal = true"
              class="btn-primary inline-flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ 'admin.newCategory' | translate }}
            </button>
          </div>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        }

        <!-- Categories List -->
        @if (!isLoading) {
          <div class="card">
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'category.name' | translate }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'category.description' | translate }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'category.status' | translate }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'category.createdAt' | translate }}
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ 'app.actions' | translate }}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  @if (categories.length === 0) {
                    <tr>
                      <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                        {{ 'admin.noCategories' | translate }}
                      </td>
                    </tr>
                  }
                  @for (category of categories; track category.id) {
                    <tr class="hover:bg-gray-50">
                      <td class="px-6 py-4">
                        <p class="text-sm font-medium text-gray-900">{{ category.name }}</p>
                      </td>
                      <td class="px-6 py-4">
                        <p class="text-sm text-gray-500">{{ category.description || '—' }}</p>
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        @if (category.active) {
                          <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {{ 'category.active' | translate }}
                          </span>
                        } @else {
                          <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {{ 'category.inactive' | translate }}
                          </span>
                        }
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {{ category.created_at | date:'short' }}
                      </td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          (click)="editCategory(category)"
                          class="text-primary-600 hover:text-primary-900 mr-3">
                          {{ 'app.edit' | translate }}
                        </button>
                        <button 
                          (click)="toggleCategoryStatus(category)"
                          class="text-amber-600 hover:text-amber-900">
                          {{ category.active ? ('category.deactivate' | translate) : ('category.activate' | translate) }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        }

        <!-- Error Message -->
        @if (errorMessage) {
          <div class="mt-4 card bg-danger-50 border-danger-200">
            <p class="text-danger-700">{{ errorMessage }}</p>
          </div>
        }
      </main>
    </div>

    <!-- Create/Edit Modal -->
    @if (showCreateModal || showEditModal) {
      <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeModals()">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" (click)="$event.stopPropagation()">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">
            {{ showEditModal ? ('admin.editCategory' | translate) : ('admin.newCategory' | translate) }}
          </h3>
          
          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <!-- Name -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'category.name' | translate }} <span class="text-danger-600">*</span>
              </label>
              <input
                type="text"
                formControlName="name"
                class="input-field"
                [class.border-danger-500]="categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched"
              />
              @if (categoryForm.get('name')?.invalid && categoryForm.get('name')?.touched) {
                <p class="mt-1 text-sm text-danger-600">{{ 'category.nameRequired' | translate }}</p>
              }
            </div>

            <!-- Description -->
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ 'category.description' | translate }}
              </label>
              <textarea
                formControlName="description"
                rows="3"
                class="input-field"
              ></textarea>
            </div>

            <!-- Active -->
            <div class="mb-6">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  formControlName="active"
                  class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span class="ml-2 text-sm text-gray-700">{{ 'category.active' | translate }}</span>
              </label>
            </div>

            <div class="flex gap-3 justify-end">
              <button 
                type="button"
                (click)="closeModals()"
                class="btn-secondary">
                {{ 'app.cancel' | translate }}
              </button>
              <button 
                type="submit"
                class="btn-primary"
                [disabled]="categoryForm.invalid || isSaving">
                {{ isSaving ? ('app.saving' | translate) : ('app.save' | translate) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class TicketCategoriesPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ticketCategoryService = inject(TicketCategoryService);

  categories: TicketCategory[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  
  showCreateModal = false;
  showEditModal = false;
  editingCategory: TicketCategory | null = null;

  categoryForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    active: [true]
  });

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.ticketCategoryService.getTicketCategories(false).subscribe({
      next: (response) => {
        this.categories = response.data || [];
        this.isLoading = false;
        console.log('✅ [CATEGORIES] Loaded:', this.categories.length);
      },
      error: (error) => {
        console.error('❌ [CATEGORIES] Failed to load:', error);
        this.errorMessage = 'Failed to load categories';
        this.isLoading = false;
      }
    });
  }

  editCategory(category: TicketCategory): void {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      description: category.description || '',
      active: category.active
    });
    this.showEditModal = true;
  }

  saveCategory(): void {
    if (this.categoryForm.invalid) return;

    this.isSaving = true;
    const formValue = this.categoryForm.value;

    // Note: API endpoints for create/update are not implemented yet
    // This is a placeholder for when the API is ready
    console.log('💾 [CATEGORIES] Would save:', formValue);
    alert('Ticket Category CRUD API is not implemented yet. This feature will be available once the API endpoints are created.');
    
    this.isSaving = false;
    this.closeModals();
  }

  toggleCategoryStatus(category: TicketCategory): void {
    // Note: API endpoint for update is not implemented yet
    console.log('🔄 [CATEGORIES] Would toggle status for:', category.name);
    alert('Ticket Category update API is not implemented yet. This feature will be available once the API endpoints are created.');
  }

  closeModals(): void {
    this.showCreateModal = false;
    this.showEditModal = false;
    this.editingCategory = null;
    this.categoryForm.reset({ active: true });
  }
}
