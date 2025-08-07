import { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '@/lib/queryClient';

export type Language = 'en' | 'fr' | 'de' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.file': 'File',
    'nav.edit': 'Edit',
    'nav.view': 'View',
    'nav.project': 'Project',
    'nav.git': 'Git',
    'nav.help': 'Help',
    'nav.saveSync': 'Save & Sync',
    'nav.usersOnline': 'users online',
    
    // User Menu
    'user.lightMode': 'Light Mode',
    'user.darkMode': 'Dark Mode',
    'user.language': 'Language',
    'user.signOut': 'Sign Out',
    
    // Languages
    'lang.english': 'English',
    'lang.french': 'French',
    'lang.german': 'German',
    'lang.spanish': 'Spanish',
    
    // File Menu
    'file.newAsset': 'New Asset...',
    'file.deleteAsset': 'Delete Asset',
    
    // Project Explorer
    'project.explorer': 'Project Explorer',
    'project.noProject': 'No project selected',
    'project.selectProject': 'Select a project to view assets',
    'project.createProject': 'Create Project',
    'project.deleteProject': 'Delete Project',
    'project.projectName': 'Project Name',
    'project.description': 'Description (optional)',
    'project.create': 'Create',
    'project.cancel': 'Cancel',
    'project.confirmDelete': 'Are you sure you want to delete',
    'project.delete': 'Delete',
    
    // Assets
    'asset.vocabulary': 'Vocabulary',
    'asset.rulesheets': 'Rulesheets',
    'asset.ruleflow': 'Ruleflow',
    'asset.rulestest': 'Rulestest',
    'asset.createAsset': 'Create Asset',
    'asset.assetName': 'Asset Name',
    'asset.assetType': 'Asset Type',
    'asset.selectType': 'Select asset type',
    
    // Editor
    'editor.noFileOpen': 'No file open',
    'editor.selectFile': 'Select a file from the explorer to start editing',
    'editor.noFilesOpen': 'No files open',
    'editor.splitEditor': 'Split Editor',
    'editor.closeAll': 'Close All',
    'editor.language': 'Language',
    'editor.validJson': 'Valid JSON',
    'editor.invalidJson': 'Invalid JSON',
    'editor.format': 'Format',
    'editor.unsavedChanges': 'Unsaved changes',
    
    // Ruleflow Editor
    'editor.ruleflow.title': 'Ruleflow Designer',
    'editor.ruleflow.dragHint': 'Drag rulesheets from the explorer to add them to the flow',
    'editor.ruleflow.emptyState': 'Drag rulesheets from the explorer to start building your flow',
    'editor.ruleflow.nodeCount': 'nodes in flow',
    
    // Status Bar
    'status.main': 'main',
    'status.sync': 'Sync: Just now',
    'status.problems': 'problems',
    'status.version': 'Corticon Studio Web v1.0.0',
    'status.jsonValid': 'JSON Schema Valid',
    
    // Git Status
    'git.status': 'Git Status',
    'git.branch': 'Branch',
    'git.commits': 'commits ahead',
    'git.modified': 'Modified',
    'git.added': 'Added',
    'git.deleted': 'Deleted',
    
    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.confirm': 'Confirm',
    'common.error': 'Error',
    'common.success': 'Success',
  },
  
  fr: {
    // Navigation
    'nav.file': 'Fichier',
    'nav.edit': 'Éditer',
    'nav.view': 'Affichage',
    'nav.project': 'Projet',
    'nav.git': 'Git',
    'nav.help': 'Aide',
    'nav.saveSync': 'Sauvegarder et synchroniser',
    'nav.usersOnline': 'utilisateurs en ligne',
    
    // User Menu
    'user.lightMode': 'Mode clair',
    'user.darkMode': 'Mode sombre',
    'user.language': 'Langue',
    'user.signOut': 'Se déconnecter',
    
    // Languages
    'lang.english': 'Anglais',
    'lang.french': 'Français',
    'lang.german': 'Allemand',
    'lang.spanish': 'Espagnol',
    
    // File Menu
    'file.newAsset': 'Nouvel élément...',
    'file.deleteAsset': 'Supprimer l\'élément',
    
    // Project Explorer
    'project.explorer': 'Explorateur de projet',
    'project.noProject': 'Aucun projet sélectionné',
    'project.selectProject': 'Sélectionnez un projet pour voir les éléments',
    'project.createProject': 'Créer un projet',
    'project.deleteProject': 'Supprimer le projet',
    'project.projectName': 'Nom du projet',
    'project.description': 'Description (optionnelle)',
    'project.create': 'Créer',
    'project.cancel': 'Annuler',
    'project.confirmDelete': 'Êtes-vous sûr de vouloir supprimer',
    'project.delete': 'Supprimer',
    
    // Assets
    'asset.vocabulary': 'Vocabulaire',
    'asset.rulesheets': 'Feuilles de règles',
    'asset.ruleflow': 'Flux de règles',
    'asset.rulestest': 'Test de règles',
    'asset.createAsset': 'Créer un élément',
    'asset.assetName': 'Nom de l\'élément',
    'asset.assetType': 'Type d\'élément',
    'asset.selectType': 'Sélectionner le type d\'élément',
    
    // Editor
    'editor.noFileOpen': 'Aucun fichier ouvert',
    'editor.selectFile': 'Sélectionnez un fichier dans l\'explorateur pour commencer l\'édition',
    'editor.noFilesOpen': 'Aucun fichier ouvert',
    'editor.splitEditor': 'Diviser l\'éditeur',
    'editor.closeAll': 'Fermer tout',
    'editor.language': 'Langue',
    'editor.validJson': 'JSON valide',
    'editor.invalidJson': 'JSON invalide',
    'editor.format': 'Formater',
    'editor.unsavedChanges': 'Modifications non sauvegardées',
    
    // Ruleflow Editor
    'editor.ruleflow.title': 'Concepteur de flux de règles',
    'editor.ruleflow.dragHint': 'Faites glisser les feuilles de règles depuis l\'explorateur pour les ajouter au flux',
    'editor.ruleflow.emptyState': 'Faites glisser les feuilles de règles depuis l\'explorateur pour commencer à construire votre flux',
    'editor.ruleflow.nodeCount': 'nœuds dans le flux',
    
    // Status Bar
    'status.main': 'principal',
    'status.sync': 'Sync: À l\'instant',
    'status.problems': 'problèmes',
    'status.version': 'Corticon Studio Web v1.0.0',
    'status.jsonValid': 'Schéma JSON valide',
    
    // Git Status
    'git.status': 'Statut Git',
    'git.branch': 'Branche',
    'git.commits': 'commits en avance',
    'git.modified': 'Modifié',
    'git.added': 'Ajouté',
    'git.deleted': 'Supprimé',
    
    // Common
    'common.loading': 'Chargement...',
    'common.save': 'Sauvegarder',
    'common.close': 'Fermer',
    'common.confirm': 'Confirmer',
    'common.error': 'Erreur',
    'common.success': 'Succès',
  },
  
  de: {
    // Navigation
    'nav.file': 'Datei',
    'nav.edit': 'Bearbeiten',
    'nav.view': 'Ansicht',
    'nav.project': 'Projekt',
    'nav.git': 'Git',
    'nav.help': 'Hilfe',
    'nav.saveSync': 'Speichern & Synchronisieren',
    'nav.usersOnline': 'Benutzer online',
    
    // User Menu
    'user.lightMode': 'Heller Modus',
    'user.darkMode': 'Dunkler Modus',
    'user.language': 'Sprache',
    'user.signOut': 'Abmelden',
    
    // Languages
    'lang.english': 'Englisch',
    'lang.french': 'Französisch',
    'lang.german': 'Deutsch',
    'lang.spanish': 'Spanisch',
    
    // File Menu
    'file.newAsset': 'Neues Element...',
    'file.deleteAsset': 'Element löschen',
    
    // Project Explorer
    'project.explorer': 'Projekt-Explorer',
    'project.noProject': 'Kein Projekt ausgewählt',
    'project.selectProject': 'Wählen Sie ein Projekt aus, um Elemente anzuzeigen',
    'project.createProject': 'Projekt erstellen',
    'project.deleteProject': 'Projekt löschen',
    'project.projectName': 'Projektname',
    'project.description': 'Beschreibung (optional)',
    'project.create': 'Erstellen',
    'project.cancel': 'Abbrechen',
    'project.confirmDelete': 'Sind Sie sicher, dass Sie löschen möchten',
    'project.delete': 'Löschen',
    
    // Assets
    'asset.vocabulary': 'Vokabular',
    'asset.rulesheets': 'Regelblätter',
    'asset.ruleflow': 'Regelfluss',
    'asset.rulestest': 'Regeltest',
    'asset.createAsset': 'Element erstellen',
    'asset.assetName': 'Elementname',
    'asset.assetType': 'Elementtyp',
    'asset.selectType': 'Elementtyp auswählen',
    
    // Editor
    'editor.noFileOpen': 'Keine Datei geöffnet',
    'editor.selectFile': 'Wählen Sie eine Datei aus dem Explorer aus, um mit der Bearbeitung zu beginnen',
    'editor.noFilesOpen': 'Keine Dateien geöffnet',
    'editor.splitEditor': 'Editor teilen',
    'editor.closeAll': 'Alle schließen',
    'editor.language': 'Sprache',
    'editor.validJson': 'Gültiges JSON',
    'editor.invalidJson': 'Ungültiges JSON',
    'editor.format': 'Formatieren',
    'editor.unsavedChanges': 'Ungespeicherte Änderungen',
    
    // Ruleflow Editor
    'editor.ruleflow.title': 'Regelfluss-Designer',
    'editor.ruleflow.dragHint': 'Ziehen Sie Regelblätter aus dem Explorer, um sie zum Fluss hinzuzufügen',
    'editor.ruleflow.emptyState': 'Ziehen Sie Regelblätter aus dem Explorer, um mit dem Aufbau Ihres Flusses zu beginnen',
    'editor.ruleflow.nodeCount': 'Knoten im Fluss',
    
    // Status Bar
    'status.main': 'haupt',
    'status.sync': 'Sync: Gerade eben',
    'status.problems': 'Probleme',
    'status.version': 'Corticon Studio Web v1.0.0',
    'status.jsonValid': 'JSON-Schema gültig',
    
    // Git Status
    'git.status': 'Git-Status',
    'git.branch': 'Branch',
    'git.commits': 'Commits voraus',
    'git.modified': 'Geändert',
    'git.added': 'Hinzugefügt',
    'git.deleted': 'Gelöscht',
    
    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.close': 'Schließen',
    'common.confirm': 'Bestätigen',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
  },
  
  es: {
    // Navigation
    'nav.file': 'Archivo',
    'nav.edit': 'Editar',
    'nav.view': 'Ver',
    'nav.project': 'Proyecto',
    'nav.git': 'Git',
    'nav.help': 'Ayuda',
    'nav.saveSync': 'Guardar y sincronizar',
    'nav.usersOnline': 'usuarios en línea',
    
    // User Menu
    'user.lightMode': 'Modo claro',
    'user.darkMode': 'Modo oscuro',
    'user.language': 'Idioma',
    'user.signOut': 'Cerrar sesión',
    
    // Languages
    'lang.english': 'Inglés',
    'lang.french': 'Francés',
    'lang.german': 'Alemán',
    'lang.spanish': 'Español',
    
    // File Menu
    'file.newAsset': 'Nuevo elemento...',
    'file.deleteAsset': 'Eliminar elemento',
    
    // Project Explorer
    'project.explorer': 'Explorador de proyecto',
    'project.noProject': 'Ningún proyecto seleccionado',
    'project.selectProject': 'Seleccione un proyecto para ver elementos',
    'project.createProject': 'Crear proyecto',
    'project.deleteProject': 'Eliminar proyecto',
    'project.projectName': 'Nombre del proyecto',
    'project.description': 'Descripción (opcional)',
    'project.create': 'Crear',
    'project.cancel': 'Cancelar',
    'project.confirmDelete': '¿Está seguro de que desea eliminar',
    'project.delete': 'Eliminar',
    
    // Assets
    'asset.vocabulary': 'Vocabulario',
    'asset.rulesheets': 'Hojas de reglas',
    'asset.ruleflow': 'Flujo de reglas',
    'asset.rulestest': 'Prueba de reglas',
    'asset.createAsset': 'Crear elemento',
    'asset.assetName': 'Nombre del elemento',
    'asset.assetType': 'Tipo de elemento',
    'asset.selectType': 'Seleccionar tipo de elemento',
    
    // Editor
    'editor.noFileOpen': 'Ningún archivo abierto',
    'editor.selectFile': 'Seleccione un archivo del explorador para comenzar a editar',
    'editor.noFilesOpen': 'Ningún archivo abierto',
    'editor.splitEditor': 'Dividir editor',
    'editor.closeAll': 'Cerrar todo',
    'editor.language': 'Idioma',
    'editor.validJson': 'JSON válido',
    'editor.invalidJson': 'JSON inválido',
    'editor.format': 'Formatear',
    'editor.unsavedChanges': 'Cambios no guardados',
    
    // Ruleflow Editor
    'editor.ruleflow.title': 'Diseñador de flujo de reglas',
    'editor.ruleflow.dragHint': 'Arrastra hojas de reglas desde el explorador para añadirlas al flujo',
    'editor.ruleflow.emptyState': 'Arrastra hojas de reglas desde el explorador para comenzar a construir tu flujo',
    'editor.ruleflow.nodeCount': 'nodos en el flujo',
    
    // Status Bar
    'status.main': 'principal',
    'status.sync': 'Sync: Ahora mismo',
    'status.problems': 'problemas',
    'status.version': 'Corticon Studio Web v1.0.0',
    'status.jsonValid': 'Esquema JSON válido',
    
    // Git Status
    'git.status': 'Estado de Git',
    'git.branch': 'Rama',
    'git.commits': 'commits adelante',
    'git.modified': 'Modificado',
    'git.added': 'Agregado',
    'git.deleted': 'Eliminado',
    
    // Common
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.close': 'Cerrar',
    'common.confirm': 'Confirmar',
    'common.error': 'Error',
    'common.success': 'Éxito',
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    
    // Save to database
    fetch('/api/auth/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language }),
    }).catch(error => {
      console.warn('Failed to save language preference:', error);
    });
  }, [language]);

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}