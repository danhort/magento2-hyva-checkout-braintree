import RootElement from '../../../../../../utils/rootElement';

const config = RootElement.getPaymentConfig();

const { isActive, clientToken, merchantId } = config?.braintree || {};

export const braintreeConfig = {
  isActive,
  clientToken: clientToken || '',
  merchantId,
};
