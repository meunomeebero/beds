import React from 'react';
import { InputOTP } from 'beds';

export function OtpHydrationProbe() {
  const [primary, setPrimary] = React.useState('123456');
  const [secondary, setSecondary] = React.useState('12');
  return React.createElement('div', { className: 'es-root' },
    React.createElement(InputOTP, {
      label: 'SSR código principal',
      value: primary,
      onChange: setPrimary,
      message: 'Primeira instância hidratada.',
    }),
    React.createElement(InputOTP, {
      label: 'SSR código secundário',
      maxLength: 4,
      value: secondary,
      onChange: setSecondary,
      message: 'Segunda instância hidratada.',
    }),
  );
}
