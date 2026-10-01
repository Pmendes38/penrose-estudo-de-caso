import Link from 'next/link';
import { Logo } from '@/shared/ui/Logo';

const paymentMethods = [
  { name: 'Visa', file: 'visa', width: 35, height: 24 },
  { name: 'American Express', file: 'amex', width: 35, height: 24 },
  { name: 'Mastercard', file: 'mastercard', width: 40, height: 24 },
  { name: 'PayPal', file: 'paypal', width: 28, height: 24 },
  { name: 'Google Pay', file: 'googlepay', width: 23, height: 24 },
  { name: 'Elo', file: 'elo', width: 49, height: 18 },
];

const socialNetworks = ['Facebook', 'Instagram', 'TikTok', 'YouTube', 'WhatsApp'] as const;

function SocialIcon({ name }: { name: typeof socialNetworks[number] }) {
  const paths = {
    Facebook: <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.7c0-.9.3-1.5 1.6-1.5h1.7V3.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.4V13h2.7v8z" fill="currentColor" stroke="none" />,
    Instagram: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" /></>,
    TikTok: <><path d="M14 3v11.8a4 4 0 1 1-4-4" /><path d="M14 3c.5 3 2.2 4.5 5.5 4.7" /></>,
    YouTube: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></>,
    WhatsApp: <><path d="M20.5 11.8a8.5 8.5 0 0 1-12.4 7.6L3 21l1.6-4.8A8.5 8.5 0 1 1 20.5 11.8Z" /><path d="M8.7 8.2c.4-.5.8-.4 1.1 0l.8 1.2c.2.3.2.6-.1.9l-.6.6c.7 1.3 1.7 2.3 3 3l.6-.6c.3-.3.6-.3.9-.1l1.2.8c.4.3.5.7 0 1.1-.6.7-1.4 1-2.3.7-2.6-.8-4.7-2.9-5.5-5.5-.3-.9 0-1.7.9-2.1Z" /></>,
  };
  return <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function StorefrontFooter() {
  return (
    <footer id="sobre" className="penrose-footer">
      <div className="penrose-footer-brand">
        <Link href="/" aria-label="Penrose — página inicial" className="penrose-footer-logo"><Logo /></Link>
        <div className="penrose-footer-social" aria-label="Redes sociais — links em breve">
          {socialNetworks.map((name) => (
            <button key={name} type="button" disabled title={`${name}: em breve`} aria-label={`${name}: em breve`}><SocialIcon name={name} /></button>
          ))}
        </div>
        <div className="penrose-footer-newsletter">
          <div className="penrose-footer-newsletter-bar">
            <input type="email" aria-label="E-mail para receber novidades" placeholder="Receba lançamentos e ações exclusivas" disabled />
            <button type="button" disabled title="Inscrições em breve">Assinar</button>
          </div>
          <p>Receba novidades e ofertas no seu e-mail · inscrições em breve</p>
        </div>
        <div className="penrose-payments" aria-label="Formas de pagamento">
          {paymentMethods.map(({ name, file, width, height }) => (
            <span className="penrose-payment" key={file}><img src={`/assets/penrose/payment-${file}.svg`} alt={name} width={width} height={height} style={{ width, height }} /></span>
          ))}
        </div>
      </div>
      <nav className="penrose-footer-column" aria-label="Institucional"><h3>Institucional</h3><Link href="/about">Quem Somos</Link><Link href="/privacy">Política de Privacidade</Link><Link href="/about#studio">O Estúdio</Link></nav>
      <nav className="penrose-footer-column" aria-label="Mais informações"><h3>Mais Informações</h3><Link href="/shipping">Política de Entrega</Link><Link href="/returns">Trocas e Devoluções</Link><Link href="/coupons">Política de Promoções</Link></nav>
      <nav className="penrose-footer-column" aria-label="Suporte ao cliente"><h3>Suporte ao Cliente</h3><a href="mailto:contato@example.com">Fale Conosco</a><Link href="/customer#perfil">Minha Conta</Link><Link href="/customer#pedidos">Meus Pedidos</Link></nav>
      <small>© 2025 Projeto Penrose — Todos os direitos reservados.</small>
    </footer>
  );
}
