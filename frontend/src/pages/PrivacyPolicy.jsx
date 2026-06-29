import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px' }}>
      <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', marginBottom: 20, display: 'inline-block' }}>← Retour à l'accueil</Link>
      <h1>Politique de Confidentialité</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>Dernière mise à jour : 28 juin 2026</p>

      <section style={{ marginBottom: 30 }}>
        <h2>1. Collecte des données</h2>
        <p>Nous collectons les informations suivantes lorsque vous utilisez Cashli :</p>
        <ul>
          <li>Adresse email et nom d'utilisateur (lors de l'inscription)</li>
          <li>Informations de paiement (via nos partenaires PayPal, Stripe)</li>
          <li>Données d'utilisation : pages visitées, offres complétées, temps passé</li>
          <li>Adresse IP et type d'appareil (pour la détection anti-fraude)</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>2. Utilisation des données</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Créditer vos récompenses et traiter vos retraits</li>
          <li>Détecter et prévenir les activités frauduleuses</li>
          <li>Améliorer notre plateforme et personnaliser votre expérience</li>
          <li>Vous contacter concernant votre compte et les offres disponibles</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>3. Partage des données</h2>
        <p>Nous ne vendons pas vos données personnelles. Nous partageons vos données uniquement avec :</p>
        <ul>
          <li>Nos partenaires de paiement (PayPal, Stripe) pour traiter vos retraits</li>
          <li>Les plateformes d'offres (offer walls) pour valider vos complétions</li>
          <li>Les autorités légales si requis par la loi</li>
        </ul>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>4. Sécurité</h2>
        <p>Nous utilisons le chiffrement SSL/TLS, le hachage des mots de passe (bcrypt), et un système de détection anti-fraude en temps réel pour protéger vos données.</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>5. Vos droits</h2>
        <p>Conformément au RGPD, vous avez le droit de :</p>
        <ul>
          <li>Accéder à vos données personnelles</li>
          <li>Rectifier ou supprimer vos données</li>
          <li>Vous opposer au traitement de vos données</li>
          <li>Exporter vos données (portabilité)</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à : alibeit543@gmail.com</p>
      </section>

      <section style={{ marginBottom: 30 }}>
        <h2>6. Cookies</h2>
        <p>Nous utilisons des cookies nécessaires au fonctionnement de l'application (authentification, session). Aucun cookie publicitaire n'est utilisé sans votre consentement explicite.</p>
      </section>
    </div>
  );
}
