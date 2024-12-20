import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
 
interface LayoutProps {
  children: React.ReactNode;
  params: {
    locale: string;
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps) {
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(params.locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={params.locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}