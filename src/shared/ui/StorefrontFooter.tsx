import Image from 'next/image';
import Link from 'next/link';
import { Logo } from '@/shared/ui/Logo';

export default function StorefrontFooter() {
  return (
    <footer id="sobre" className="penrose-footer">
      <div className="penrose-footer-brand">
        <Logo className="h-9 w-auto" />
        <p>Action figures, colecionáveis e projetos personalizados.</p>
        <div className="penrose-payments" aria-label="Formas de pagamento">
          {['visa', 'amex', 'mastercard', 'paypal', 'googlepay', 'elo'].map((name) => <Image key={name} src={`/assets/penrose/payment-${name}.svg`} alt={name} width={35} height={24} unoptimized />)}
        </div>
      </div>
      <div><h3>Institucional</h3><Link href="/#sobre">Quem Somos</Link><Link href="/privacy">Política de Privacidade</Link><a href="mailto:contato@example.com">O Estúdio</a></div>
      <div><h3>Mais Informações</h3><Link href="/shipping">Política de Entrega</Link><Link href="/returns">Trocas e Devoluções</Link><Link href="/coupons">Política de Promoções</Link></div>
      <div><h3>Suporte ao Cliente</h3><a href="mailto:contato@example.com">Fale Conosco</a><Link href="/customer">Minha Conta</Link><Link href="/customer">Meus Pedidos</Link></div>
      <small>© 2025 Projeto Penrose — Todos os direitos reservados.</small>
    </footer>
  );
}
