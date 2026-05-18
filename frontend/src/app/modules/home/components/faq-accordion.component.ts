import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-faq-accordion',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.Emulated,
  animations: [
    trigger('expandCollapse', [
      state('open', style({
        height: '*',
        opacity: 1,
        overflow: 'hidden',
      })),
      state('closed', style({
        height: '0px',
        opacity: 0,
        overflow: 'hidden',
      })),
      transition('open <=> closed', [
        animate('300ms ease-in-out'),
      ]),
    ]),
  ],
  template: `
    <div class="faq-container">
      <div class="faq-header">
        <h3>Perguntas Frequentes</h3>
        <p>Tudo o que precisa saber sobre o Sistema de Planeamento de Viagens</p>
      </div>

      <div class="faq-list">
        <div
          *ngFor="let item of faqItems"
          class="faq-item"
          [class.open]="item.open"
        >
          <button
            class="faq-question"
            (click)="toggleItem(item.id)"
            [attr.aria-expanded]="item.open"
          >
            <span class="question-text">{{ item.question }}</span>
            <span class="icon" [class.rotate]="item.open">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M7.5 8.5L10 11L12.5 8.5"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
          </button>

          <div
            class="faq-answer"
            [@expandCollapse]="item.open ? 'open' : 'closed'"
          >
            <div class="answer-content">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faq-container {
      padding: 3rem 2rem;
      background: white;
      border-radius: 12px;
      max-width: 800px;
      margin: 3rem auto;
    }

    .faq-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .faq-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
    }

    .faq-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .faq-item {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .faq-item.open {
      border-color: #667eea;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
    }

    .faq-question {
      width: 100%;
      padding: 1.5rem;
      background: white;
      border: none;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
      text-align: left;
      transition: background-color 0.3s ease;
      font-size: 1rem;
      font-weight: 600;
      color: #1f2937;
    }

    .faq-question:hover {
      background-color: #f9fafb;
    }

    .faq-item.open .faq-question {
      background-color: #f3f4f6;
      color: #667eea;
    }

    .question-text {
      flex: 1;
      text-align: left;
    }

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: #6b7280;
      transition: transform 0.3s ease, color 0.3s ease;
    }

    .faq-item.open .icon {
      color: #667eea;
    }

    .icon.rotate {
      transform: rotate(180deg);
    }

    .faq-answer {
      overflow: hidden;
    }

    .answer-content {
      padding: 1rem 1.5rem;
      background: #f9fafb;
      color: #4b5563;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    @media (max-width: 640px) {
      .faq-container {
        padding: 2rem 1rem;
        margin: 2rem 1rem;
      }

      .faq-header h3 {
        font-size: 1.5rem;
      }

      .faq-question {
        padding: 1.25rem;
      }

      .answer-content {
        padding: 1rem 1.25rem;
      }
    }
  `],
})
export class FaqAccordionComponent {
  faqItems: FaqItem[] = [
    {
      id: '1',
      question: 'Como posso criar uma nova viagem?',
      answer: 'Após fazer login, clique no botão "Nova Viagem" no dashboard. Preencha o destino, datas e orçamento. Pode adicionar dias de itinerário e atividades individuais após criar a viagem.',
      open: false,
    },
    {
      id: '2',
      question: 'Como funcionam as despesas?',
      answer: 'Cada viagem permite registar despesas com categoria, valor e data. O sistema calcula automaticamente o total real vs. orçado, mostrando alertas se exceder o limite definido.',
      open: false,
    },
    {
      id: '3',
      question: 'Posso partilhar minhas viagens com amigos?',
      answer: 'No momento, as viagens são privadas por utilizador. Recomendamos exportar em PDF ou CSV para partilhar o itinerário e despesas com terceiros.',
      open: false,
    },
    {
      id: '4',
      question: 'O sistema suporta múltiplas moedas?',
      answer: 'Sim! Pode escolher a moeda ao criar a viagem (EUR, USD, GBP, BRL, etc.). O sistema exibe o símbolo correspondente em todos os cálculos.',
      open: false,
    },
    {
      id: '5',
      question: 'Como alterno entre modo escuro e claro?',
      answer: 'Clique no ícone de lua/sol no canto superior direito da aplicação. A preferência é guardada automaticamente.',
      open: false,
    },
  ];

  toggleItem(id: string): void {
    const item = this.faqItems.find((f) => f.id === id);
    if (item) {
      item.open = !item.open;
    }
  }
}
