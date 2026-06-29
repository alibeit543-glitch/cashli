import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>← Retour à l'accueil</Link>
      <h1>Conditions d'Utilisation</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>Dernière mise à jour : 28 juin 2026</p>

      <section style={{ marginBottom: 30 }}>
        <h2>1. Acceptation des conditions</h2>
        <p>En utilisant Cashli, vous acceptez les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>2. Éligibilité</h2>
        <p>Vous devez avoir au moins 18 ans pour utiliser Cashli. En créant un compte, vous certifiez que vous avez l'âge légal requis.</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>3. Compte utilisateur</h2>
        <ul>
          <li>Vous êtes responsable de la sécurité de votre mot de passe</li>
          <li>Chaque utilisateur ne peut avoir qu'un seul compte</li>
          <li>La création de comptes multiples est interdite et entraînera la suspension de tous les comptes</li>
          <li>Vous devez fournir des informations exactes et à jour</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>4. Fraude et abus</h2>
        <p>Les activités suivantes sont strictement interdites :</p>
        <ul>
          <li>Utilisation de VPN/proxy pour masquer votre localisation</li>
          <li>Utilisation de bots, scripts ou automation</li>
          <li>Création de comptes multiples (farming)</li>
          <li>Auto-référencement (créer un compte via son propre lien)</li>
          <li>Toute tentative de manipulation du système</li>
        </ul>
        <p>La détection de ces activités entraînera la suspension immédiate du compte et la confiscation des gains.</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>5. Récompenses et retraits</h2>
        <ul>
          <li>Les récompenses sont créditées après validation de la complétion d'une offre</li>
          <li>Le montant minimum de retrait varie selon la méthode choisie</li>
          <li>Les retraits sont traités sous 24-48h ouvrés</li>
          <li>Cashli se réserve le droit de refuser un retrait en cas de suspicion de fraude</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>6. Limitation de responsabilité</h2>
        <p>Cashli est fourni "tel quel". Nous ne garantissons pas que le service sera ininterrompu ou sans erreur. Cashli n'est pas responsable des pertes indirectes liées à l'utilisation de la plateforme.</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>7. Résiliation</h2>
        <p>Nous nous réservons le droit de suspendre ou résilier votre compte à tout moment, sans préavis, en cas de violation des présentes conditions.</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>8. Contact</h2>
        <p>Pour toute question concernant ces conditions, contactez-nous à : alibeit543@gmail.com</p>
      </section>
    </div>
  );
}
