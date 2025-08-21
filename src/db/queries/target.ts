export function insertSavuQuery(): string {
  return `
    INSERT INTO savu (
      code_vu,
      code_cis,
      code_dossier,
      nom_vu,
      num_element,
      code_substance,
      num_composant,
      code_unite_dosage,
      code_nature,
      dosage_libra_typo,
      dosage_libra,
      lib_court,
      nom_substance,
      code_produit,
      lib_nature,
      lib_forme_ph,
      lib_rech_substance,
      lib_rech_denomination
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertVuutilQuery(): string {
  return `
    INSERT INTO vuutil (
      code_vu,
      code_cis,
      code_dossier,
      nom_vu,
      dbo_autorisation_lib_abr,
      dbo_classe_atc_lib_abr,
      dbo_classe_atc_lib_court,
      code_contact,
      nom_contact_libra,
      adresse_contact,
      adresse_compl,
      code_post,
      nom_ville,
      tel_contact,
      fax_contact,
      dbo_pays_lib_court,
      dbo_statut_speci_lib_abr,
      statut_abrege,
      code_acteur,
      code_tigre,
      nom_acteur_long,
      adresse,
      adresse_compl_expl,
      code_post_expl,
      nom_ville_expl,
      complement,
      tel,
      fax,
      dbo_pays_lib_abr,
      code_produit,
      lib_rech_denomination,
      code_vuprinceps
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertCodexcodeAtcQuery(): string {
  return `
    INSERT INTO codexcode_atc (
      code_atc,
      lib_court,
      nb_car_code_atc,
      type_code_atc
    ) VALUES (?, ?, ?, ?)
  `;
}

export function insertCodexpictoGrossesseQuery(): string {
  return `
    INSERT INTO codexpicto_grossesse (
      code_vu,
      num_presentation,
      nom_presentation,
      code_cip,
      code_cip13,
      statut_comm,
      code_picto,
      lib_picto
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertCodexpresentationQuery(): string {
  return `
    INSERT INTO codexpresentation (
      code_vu,
      num_presentation,
      nom_presentation,
      code_cip,
      code_cip13,
      statut_comm,
      info_comm_court,
      info_comm_long
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertCodexvoieAdminQuery(): string {
  return `
    INSERT INTO codexvoie_admin (
      code_vu,
      code_voie,
      lib_abr,
      lib_court,
      lib_long,
      lib_rech,
      num_ordre_edit,
      indic_valide
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDboComposantsHaumeaQuery(): string {
  return `
    INSERT INTO dbo_composants_haumea (
      code_vu,
      num_element,
      code_substance,
      num_composant,
      code_unite_dosage,
      code_nom_substance,
      code_nature,
      qte_dosage,
      dosage_libra,
      dosage_libra_typo,
      cep,
      num_ordre_edit,
      rem_composants,
      date_creation,
      date_dern_modif,
      indic_valide,
      code_modif
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDboContactHaumeaQuery(): string {
  return `
    INSERT INTO dbo_contact_haumea (
      code_contact,
      code_pays,
      code_groupe_labo,
      nom_contact,
      lib_rech,
      code_amm,
      code_libra,
      code_muse,
      nom_contact_libra,
      adresse_contact,
      adresse_compl,
      code_post,
      nom_ville,
      tel_contact,
      fax_contact,
      nom_responsable,
      indic_candidat,
      date_creation,
      date_dern_modif,
      code_origine,
      rem_contact,
      flag_actif,
      code_modif
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDboDossierHaumeaQuery(): string {
  return `
    INSERT INTO dbo_dossier_haumea (
      code_vu,
      code_dossier,
      code_nature_code,
      num_ordre_edit,
      date_debut,
      date_fin,
      rem_dossier
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDboNomsSubstanceHaumeaQuery(): string {
  return `
    INSERT INTO dbo_noms_substance_haumea (
      code_nom_substance,
      code_substance,
      nom_substance,
      lib_rech,
      code_denom,
      code_origine_nom,
      indic_valide,
      nom_valide_par,
      indic_candidat,
      date_creation,
      date_dern_modif
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDboVuHaumeaQuery(): string {
  return `
    INSERT INTO dbo_vuhaumea (
      code_vu,
      code_cis,
      code_dossier,
      code_produit,
      code_innovation,
      code_autorisation,
      nom_vu,
      lib_rech,
      code_vucommun,
      num_dossier_commun,
      code_vuprinceps,
      date_amm,
      rem_vu,
      indic_valide,
      nom_valide_par,
      date_creation,
      date_dern_modif,
      date_autorisation,
      code_origine,
      commentaire_vu,
      rem_notes,
      flag_nouvelle,
      code_statut,
      statut_qualif,
      code_modif,
      code_pays_provenance,
      nom_vutypo,
      nom_court,
      nom_court_typo,
      text_solvants
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDboVuTitulairesHaumeaQuery(): string {
  return `
    INSERT INTO dbo_vutitulaires_haumea (
      code_vu,
      code_contact,
      date_debut,
      date_fin,
      identite_provisoire,
      rem_commentaire,
      indic_valide,
      date_creation,
      date_dern_modif,
      code_modif
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertVudelivranceQuery(): string {
  return `
    INSERT INTO vudelivrance (
      code_vu,
      code_delivrance,
      lib_long
    ) VALUES (?, ?, ?)
  `;
}

export function insertDashboardRs5Query(values: string[]): string {
  return `
    INSERT INTO dashboard_rs5 (
      code_vu,
      code_cis,
      code_dossier,
      nom_vu,
      type_procedure,
      code_atc,
      lib_atc,
      forme_pharma,
      voie_admin,
      statut_specialite,
      code_terme,
      code_produit,
      indic_valide,
      code_cip13,
      nom_presentation,
      nom_substance,
      dosage_libra,
      classe_acp_lib_court,
      date_extract
    ) VALUES ${values.join(',')}
  `;
}

export function insertMocatorDocumentQuery(): string {
  return `
    INSERT INTO mocatordocument (
      doc_id,
      grp_id,
      not_id,
      date_arch,
      date_notif,
      srce_name,
      srce_size,
      srce_last_upd,
      native_format,
      server_name,
      rem,
      author,
      seance_id,
      date_seance
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertMocatorDocumentHtmlQuery(): string {
  return `
    INSERT INTO mocatordocument_html (
      hdoc_id,
      spec_id,
      doc_id,
      typ_id,
      hname,
      date_conv
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
}

export function insertMocatorDocumentXmlQuery(): string {
  return `
    INSERT INTO mocatordocument_xml (
      xdoc_id,
      code_vu,
      doc_id,
      nature_doc,
      statut_doc,
      auteur,
      server_name,
      srce_name,
      srce_size,
      srce_last_upd,
      native_format,
      version_dtd,
      doc_joint,
      num_ordre,
      date_maj_amm,
      date_valide,
      date_liv,
      date_arch,
      commentaire
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
}

export function insertDatesLancementsExtractionsQuery(): string {
  return `
    INSERT INTO dates_lancements_extractions (
      date_debut_extraction,
      date_fin_extraction,
      nb_tables_extraites
    ) VALUES (?, ?, ?)
  `;
} 