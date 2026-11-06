import type { TFunction } from "i18next";
import { CopingCard } from "@/types/coping";
import { Routine } from "@/types/routine";

export interface Localizable {
  /** Prefixo das chaves de tradução, ex.: "defaults.coping.grounding514" */
  i18nKey?: string;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => sameValue(v, b[i]));
  }
  if (
    a &&
    b &&
    typeof a === "object" &&
    typeof b === "object" &&
    !Array.isArray(a) &&
    !Array.isArray(b)
  ) {
    const aObj = a as Record<string, unknown>;
    const bObj = b as Record<string, unknown>;
    const aKeys = Object.keys(aObj);
    const bKeys = Object.keys(bObj);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => sameValue(aObj[key], bObj[key]));
  }
  return a === b;
}

/**
 * Localiza os textos de um conteúdo padrão (mensagens do cartão de crise)
 * somente enquanto o usuário não os tiver personalizado. Se um campo foi
 * editado, o texto salvo é preservado.
 *
 * @param item      Conteúdo atual (pode vir do armazenamento persistido)
 * @param original  Conteúdo padrão original, usado como referência
 * @param fields    Campos que devem ser traduzidos (ex.: ["title", "content"])
 */
export function localizeFields<T extends Localizable>(
  item: T,
  original: T | undefined,
  fields: string[],
  t: TFunction
): T {
  const key = original?.i18nKey;
  if (!key) return item;

  const current = item as unknown as Record<string, unknown>;
  const source = original as unknown as Record<string, unknown>;

  const untouched = fields.every((field) => sameValue(current[field], source[field]));
  if (!untouched) return item;

  const result = { ...current } as Record<string, unknown>;
  for (const field of fields) {
    const translated = t(`${key}.${field}`, { returnObjects: true });
    if (typeof translated === "string" || Array.isArray(translated)) {
      result[field] = translated;
    }
  }
  return result as unknown as T;
}

/**
 * Localiza um cartão de coping padrão (título, descrição e passos) enquanto
 * o usuário não tiver customized cada campo.
 */
export function localizeCopingCard(
  card: CopingCard,
  original: CopingCard | undefined,
  t: TFunction
): CopingCard {
  if (!original?.i18nKey) return card;

  const key = original.i18nKey;
  const result: CopingCard = { ...card };

  if (card.title === original.title) {
    result.title = t(`${key}.title`);
  }
  if (card.description === original.description) {
    result.description = t(`${key}.description`);
  }

  const translatedSteps = t(`${key}.steps`, { returnObjects: true });
  if (Array.isArray(translatedSteps)) {
    result.steps = card.steps.map((step, index) => {
      const originalIndex = original.steps.findIndex((s) => s.id === step.id);
      const source = originalIndex >= 0 ? original.steps[originalIndex] : original.steps[index];
      const translated = translatedSteps[originalIndex >= 0 ? originalIndex : index];
      if (!source || typeof translated !== "string") return step;
      return step === source ? translated : step;
    });
  }

  return result;
}

/**
 * Localiza uma rotina padrão (nome, descrição e passos) enquanto o usuário
 * não tiver customized cada campo.
 */
export function localizeRoutine(
  routine: Routine,
  original: Routine | undefined,
  t: TFunction
): Routine {
  if (!original?.i18nKey) return routine;

  const key = original.i18nKey;
  const result: Routine = { ...routine };

  if (routine.name === original.name) {
    result.name = t(`${key}.name`);
  }
  if (routine.description === original.description) {
    result.description = t(`${key}.description`);
  }

  const translatedSteps = t(`${key}.steps`, { returnObjects: true });
  if (Array.isArray(translatedSteps)) {
    result.steps = routine.steps.map((step, index) => {
      const originalIndex = original.steps.findIndex((s) => s.id === step.id);
      const source = original.steps[originalIndex >= 0 ? originalIndex : index];
      const translated = translatedSteps[originalIndex >= 0 ? originalIndex : index];
      if (!source || !translated || typeof translated !== "object") return step;

      const next = { ...step };
      if (step.title === source.title && typeof translated.title === "string") {
        next.title = translated.title;
      }
      if (
        step.description &&
        step.description === source.description &&
        typeof translated.description === "string"
      ) {
        next.description = translated.description;
      }
      return next;
    });
  }

  return result;
}
