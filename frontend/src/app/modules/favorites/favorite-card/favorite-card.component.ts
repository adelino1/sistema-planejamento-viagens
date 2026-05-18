import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Favorite } from '../../../services/favorite.service';

@Component({
  selector: 'app-favorite-card',
  templateUrl: './favorite-card.component.html',
  styleUrls: ['./favorite-card.component.scss'],
})
export class FavoriteCardComponent {
  @Input() favorite!: Favorite;
  @Output() edit = new EventEmitter<Favorite>();
  @Output() delete = new EventEmitter<number>();

  getTypeIcon(type: string): string {
    return type === 'destination' ? '🌍' : '📍';
  }

  getTypeLabel(type: string): string {
    return type === 'destination' ? 'Destino' : 'Local';
  }

  onEdit(): void {
    this.edit.emit(this.favorite);
  }

  onDelete(): void {
    if (confirm('Tem a certeza de que deseja eliminar este favorito?')) {
      this.delete.emit(this.favorite.id);
    }
  }

  getLocation(): string {
    const parts = [];
    if (this.favorite.city) parts.push(this.favorite.city);
    if (this.favorite.country) parts.push(this.favorite.country);
    return parts.join(', ') || 'Localização não especificada';
  }
}
