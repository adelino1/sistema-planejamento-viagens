import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FavoriteService, Favorite, CreateFavoriteDto } from '../../../services/favorite.service';

@Component({
  selector: 'app-favorite-list',
  templateUrl: './favorite-list.component.html',
  styleUrls: ['./favorite-list.component.scss'],
})
export class FavoriteListComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  loading = true;
  error: string | null = null;
  showForm = false;
  editingFavorite: Favorite | null = null;
  submitting = false;

  constructor(private readonly favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  loadFavorites(): void {
    this.loading = true;
    this.error = null;
    this.favoriteService.getFavorites().subscribe({
      next: (res) => {
        this.favorites = res.data;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.error = err.error?.message || 'Erro ao carregar favoritos';
        this.loading = false;
      },
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    this.editingFavorite = null;
  }

  onEditFavorite(favorite: Favorite): void {
    this.editingFavorite = favorite;
    this.showForm = true;
  }

  onSubmitFavorite(dto: CreateFavoriteDto): void {
    this.submitting = true;

    const request = this.editingFavorite
      ? this.favoriteService.updateFavorite(this.editingFavorite.id, dto)
      : this.favoriteService.createFavorite(dto);

    request.subscribe({
      next: () => {
        this.showForm = false;
        this.editingFavorite = null;
        this.submitting = false;
        this.loadFavorites();
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'Erro ao guardar favorito');
        this.submitting = false;
      },
    });
  }

  onCancelFavorite(): void {
    this.showForm = false;
    this.editingFavorite = null;
  }

  onDeleteFavorite(id: number): void {
    this.favoriteService.deleteFavorite(id).subscribe({
      next: () => {
        this.loadFavorites();
      },
      error: (err: HttpErrorResponse) => {
        alert(err.error?.message || 'Erro ao eliminar favorito');
      },
    });
  }

  get sortedFavorites(): Favorite[] {
    return [...this.favorites].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  get groupedFavorites(): { [key: string]: Favorite[] } {
    return this.sortedFavorites.reduce((acc, fav) => {
      const key = fav.favorite_type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(fav);
      return acc;
    }, {} as { [key: string]: Favorite[] });
  }
}
