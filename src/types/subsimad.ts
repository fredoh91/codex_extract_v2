// Exemple pour src/types/subsimad.ts
export interface SubSimad {
  id?: number; // Optionnel si auto-incrémenté
  productfamily: string;
  topproductname: string;
  productname: string;
  creation_date: string;
  modification_date: string;
  unii_id: string;
  cas_id: string;
  is_product_enabled: number;
  product_pv: number;
  product_addicto: number;
}
