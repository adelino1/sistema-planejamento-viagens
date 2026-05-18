import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface BudgetResult {
  total: number;
  perDay: number;
  breakdown: {
    accommodation: number;
    meals: number;
    activities: number;
    transport: number;
  };
}

@Component({
  selector: 'app-budget-simulator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  encapsulation: ViewEncapsulation.Emulated,
  template: `
    <div class="budget-simulator">
      <div class="simulator-header">
        <h3>Simulador de Orçamento</h3>
        <p>Calcule quanto vai gastar na sua viagem</p>
      </div>

      <form [formGroup]="form" class="simulator-form">
        <div class="form-group">
          <label for="destination">Destino</label>
          <select id="destination" formControlName="destination">
            <option value="">Selecione um destino</option>
            <option value="europe">Europa</option>
            <option value="asia">Ásia</option>
            <option value="americas">Américas</option>
            <option value="africa">África</option>
            <option value="oceania">Oceânia</option>
          </select>
        </div>

        <div class="form-group">
          <label for="duration">Duração: {{ form.get('duration')?.value }} dias</label>
          <input
            id="duration"
            type="range"
            min="1"
            max="30"
            formControlName="duration"
            class="slider"
          />
        </div>

        <div class="form-group">
          <label for="comfort">Nível de Conforto</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="economico" formControlName="comfort" />
              <span>Económico (budge)</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="standard" formControlName="comfort" />
              <span>Standard (confortável)</span>
            </label>
            <label class="radio-label">
              <input type="radio" value="luxo" formControlName="comfort" />
              <span>Luxo (premium)</span>
            </label>
          </div>
        </div>
      </form>

      <div *ngIf="result" class="result-box">
        <div class="result-item">
          <span class="label">Total estimado</span>
          <span class="value">€{{ result.total | number: '1.2-2' }}</span>
        </div>
        <div class="result-item">
          <span class="label">Por dia</span>
          <span class="value">€{{ result.perDay | number: '1.2-2' }}</span>
        </div>

        <div class="breakdown">
          <h4>Detalhamento</h4>
          <div class="breakdown-row">
            <span>Alojamento</span>
            <span>€{{ result.breakdown.accommodation | number: '1.2-2' }}</span>
          </div>
          <div class="breakdown-row">
            <span>Refeições</span>
            <span>€{{ result.breakdown.meals | number: '1.2-2' }}</span>
          </div>
          <div class="breakdown-row">
            <span>Atividades</span>
            <span>€{{ result.breakdown.activities | number: '1.2-2' }}</span>
          </div>
          <div class="breakdown-row">
            <span>Transporte</span>
            <span>€{{ result.breakdown.transport | number: '1.2-2' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .budget-simulator {
      padding: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .simulator-header {
      margin-bottom: 2rem;
      text-align: center;
    }

    .simulator-header h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .simulator-header p {
      margin: 0;
      opacity: 0.9;
    }

    .simulator-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      font-size: 0.95rem;
    }

    .form-group select,
    .form-group input[type="range"] {
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.9);
      color: #333;
    }

    .form-group select:focus,
    .form-group input[type="range"]:focus {
      outline: 2px solid #fbbf24;
    }

    .slider {
      cursor: pointer;
      height: 6px;
      background: rgba(255, 255, 255, 0.3);
    }

    .radio-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .radio-label input[type="radio"] {
      cursor: pointer;
      width: 18px;
      height: 18px;
    }

    .result-box {
      background: rgba(255, 255, 255, 0.15);
      padding: 1.5rem;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .result-item .label {
      opacity: 0.85;
    }

    .result-item .value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .breakdown {
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .breakdown h4 {
      margin: 0 0 1rem 0;
      font-size: 0.95rem;
      opacity: 0.85;
    }

    .breakdown-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    @media (max-width: 640px) {
      .budget-simulator {
        padding: 1.5rem;
      }

      .radio-group {
        flex-direction: column;
      }
    }
  `],
})
export class BudgetSimulatorComponent {
  form: FormGroup;
  result: BudgetResult | null = null;

  private readonly costsByComfort = {
    economico: { accommodation: 30, meals: 20, activities: 15, transport: 10 },
    standard: { accommodation: 60, meals: 40, activities: 30, transport: 20 },
    luxo: { accommodation: 120, meals: 80, activities: 60, transport: 40 },
  };

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      destination: ['', Validators.required],
      duration: [7, [Validators.required, Validators.min(1), Validators.max(30)]],
      comfort: ['standard', Validators.required],
    });

    this.form.valueChanges.subscribe(() => this.calculate());
  }

  private calculate(): void {
    if (this.form.invalid) {
      this.result = null;
      return;
    }

    const { duration, comfort } = this.form.getRawValue();
    const costs = this.costsByComfort[comfort as keyof typeof this.costsByComfort];

    const breakdown = {
      accommodation: costs.accommodation * duration,
      meals: costs.meals * duration,
      activities: costs.activities * duration,
      transport: costs.transport * duration,
    };

    const total = Object.values(breakdown).reduce((a, b) => a + b, 0);

    this.result = {
      total,
      perDay: total / duration,
      breakdown,
    };
  }
}
