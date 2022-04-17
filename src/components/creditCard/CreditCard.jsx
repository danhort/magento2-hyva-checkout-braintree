import React, { useCallback, useEffect, useState } from 'react';
import { shape, func } from 'prop-types';
import dropin from 'braintree-web-drop-in';
import RadioInput from '../../../../../components/common/Form/RadioInput';
import { braintreeConfig } from './utility';
import { usePerformPlaceOrderByREST } from '../../../../../hook';
import { paymentMethodShape } from '../../../../../utils/payment';
import useBraintreeCheckoutFormContext from '../../hooks/useBraintreeCheckoutFormContext';

function CreditCard({ method, selected, actions }) {
  const isSelected = method.code === selected.code;
  const [braintreeInstance, setBraintreeInstance] = useState(undefined);
  const { registerPaymentAction } = useBraintreeCheckoutFormContext();
  const performPlaceOrder = usePerformPlaceOrderByREST(method.code);

  const paymentSubmitHandler = useCallback(
    async (values) => {
      await braintreeInstance.requestPaymentMethod((error, payload) => {
        if (error) {
          console.error(error);
        } else {
          performPlaceOrder(values, {
            additionalData: {
              payment_method_nonce: payload.nonce,
              device_data: payload.deviceData,
            },
          });
        }
      });
    },
    [braintreeInstance, performPlaceOrder]
  );

  useEffect(() => {
    registerPaymentAction('braintree', paymentSubmitHandler);
  }, [registerPaymentAction, paymentSubmitHandler]);

  useEffect(() => {
    if (isSelected && braintreeConfig.isActive && braintreeConfig.clientToken) {
      const initializeBraintree = () =>
        dropin.create(
          {
            authorization: braintreeConfig.clientToken,
            container: '#braintree-drop-in-div',
          },
          function (error, instance) {
            if (error) console.error(error);
            else setBraintreeInstance(instance);
          }
        );

      if (braintreeInstance) {
        braintreeInstance.teardown().then(() => {
          initializeBraintree();
        });
      } else {
        initializeBraintree();
      }
    }
  }, [isSelected, braintreeConfig]);

  const radioInputTag = (
    <RadioInput
      value={method.code}
      label={method.title}
      name="paymentMethod"
      checked={isSelected}
      onChange={actions.change}
    />
  );

  if (isSelected && braintreeConfig.isActive && braintreeConfig.clientToken) {
    const elementsTag = <div id="braintree-drop-in-div" />;
    return [radioInputTag, elementsTag];
  }
  return radioInputTag;
}

CreditCard.propTypes = {
  method: paymentMethodShape.isRequired,
  selected: paymentMethodShape.isRequired,
  actions: shape({ change: func }).isRequired,
};

export default CreditCard;
