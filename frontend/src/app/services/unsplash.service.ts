import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Unsplash API
 * Documentação: https://unsplash.com/developers
 * 
 * Free tier: 50 requisições/hora (sem autenticação)
 * Para mais: criar aplicação em https://unsplash.com/oauth/applications
 * 
 * Para usar com chave de acesso (recomendado para produção):
 * 1. Criar conta em https://unsplash.com
 * 2. Criar aplicação em https://unsplash.com/oauth/applications
 * 3. Copiar Access Key para a variável accessKey abaixo
 */

export interface UnsplashImage {
  id: string;
  urls: {
    small: string;
    regular: string;
    full: string;
  };
  alt_description: string | null;
  description: string | null;
  user: {
    name: string;
    username: string;
  };
  links: {
    html: string;
  };
}

export interface UnsplashSearchResponse {
  results: UnsplashImage[];
  total: number;
  total_pages: number;
}

export interface DestinationImage {
  imageUrl: string;
  smallUrl: string;
  alt: string;
  credit: string; // "Photographer name on Unsplash"
  photographerLink: string;
}

@Injectable({
  providedIn: 'root',
})
export class UnsplashService {
  /**
   * ⚠️ IMPORTANTE: Para produção, usar chave de acesso
   * 
   * Passo a passo:
   * 1. Ir a https://unsplash.com/oauth/applications
   * 2. Clicar "New Application"
   * 3. Preencher as informações da app
   * 4. Copiar "Access Key"
   * 5. Substituir a variável abaixo:
   * 
   * private readonly accessKey = 'YOUR_ACCESS_KEY_HERE';
   * 
   * Sem chave (demo): funciona mas com rate limit de 50 req/hora
   */
  private readonly accessKey = ''; // Deixar vazio para usar endpoint público sem auth
  private readonly apiUrl = 'https://api.unsplash.com/search/photos';
  private readonly publicApiUrl = 'https://source.unsplash.com';

  constructor(private readonly http: HttpClient) {}

  /**
   * Pesquisa imagens de um destino no Unsplash
   * @param city Nome da cidade (ex: "Paris", "Rio de Janeiro")
   * @param country Nome do país (ex: "France", "Brazil") - opcional
   * @returns Observable com a melhor imagem encontrada
   */
  searchDestinationImage(city: string, country?: string): Observable<DestinationImage | null> {
    if (!city || city.trim().length === 0) {
      return of(null);
    }

    // Construir query: "Paris, France" ou apenas "Paris"
    const query = country ? `${city}, ${country}` : city;

    // Se tiver accessKey, usar API autenticada (sem rate limit)
    if (this.accessKey) {
      return this.searchWithAuth(query);
    }

    // Caso contrário, usar endpoint público simples (50 req/hora)
    return this.searchPublic(query);
  }

  /**
   * Pesquisa com autenticação (recomendado para produção)
   */
  private searchWithAuth(query: string): Observable<DestinationImage | null> {
    return this.http
      .get<UnsplashSearchResponse>(this.apiUrl, {
        params: {
          query,
          per_page: '1',
          client_id: this.accessKey,
        },
      })
      .pipe(
        map((response) => {
          if (response.results.length === 0) {
            return null;
          }
          return this.parseUnsplashImage(response.results[0]);
        }),
        catchError(() => of(null)),
      );
  }

  /**
   * Pesquisa via endpoint público (sem autenticação, mas com rate limit)
   * Retorna redirect automático para a melhor imagem
   */
  private searchPublic(query: string): Observable<DestinationImage | null> {
    // O endpoint público do Unsplash redireciona automaticamente
    // Portanto, construímos a URL e retornamos direto
    const imageUrl = `${this.publicApiUrl}/1600x900/?${new URLSearchParams({
      query,
      orientation: 'landscape',
    })}`;

    // Retornar um objeto com a URL construída
    // Nota: Sem autenticação, não temos metadados (alt, photographer)
    return of({
      imageUrl,
      smallUrl: `${this.publicApiUrl}/400x300/?${new URLSearchParams({ query })}`,
      alt: `Photo of ${query}`,
      credit: 'Unsplash',
      photographerLink: 'https://unsplash.com',
    });
  }

  /**
   * Faz parsing da resposta do Unsplash para o formato esperado
   */
  private parseUnsplashImage(image: UnsplashImage): DestinationImage {
    return {
      imageUrl: image.urls.regular,
      smallUrl: image.urls.small,
      alt: image.alt_description || image.description || 'Destination image',
      credit: `${image.user.name} on Unsplash`,
      photographerLink: `https://unsplash.com/@${image.user.username}`,
    };
  }

  /**
   * Retorna uma imagem mockada para testes/fallback
   */
  getMockImage(city: string): DestinationImage {
    // URLs públicas de alta qualidade que funcionam sempre
    const mockImages: { [key: string]: string } = {
      paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
      london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1200&q=80',
      tokyo: 'https://images.unsplash.com/photo-1540959375944-7049f642e9f1?auto=format&fit=crop&w=1200&q=80',
      'new york': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=1200&q=80',
      'rio de janeiro': 'https://images.unsplash.com/photo-1483729558449-99daa64c9d56?auto=format&fit=crop&w=1200&q=80',
      barcelona: 'https://images.unsplash.com/photo-1583422409516-2895a77f3df8?auto=format&fit=crop&w=1200&q=80',
      amsterdam: 'https://images.unsplash.com/photo-1520918541564-48b109adde33?auto=format&fit=crop&w=1200&q=80',
      dubai: 'https://images.unsplash.com/photo-1512453809136-bada5a9e94cf?auto=format&fit=crop&w=1200&q=80',
      default:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
    };

    const key = city.toLowerCase();
    const imageUrl = mockImages[key] || mockImages['default'];

    return {
      imageUrl,
      smallUrl: imageUrl.replace('w=1200', 'w=400').replace('q=80', 'q=70'),
      alt: `Beautiful view of ${city}`,
      credit: 'Unsplash Community',
      photographerLink: 'https://unsplash.com',
    };
  }
}
