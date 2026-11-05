import esCommon from '../../messages/es/common.json';
import esCommon from '../../messages/es/common.json';
import esBuylist from '../../messages/es/buylist.json';
import esErrors from '../../messages/es/errors.json';
import esNav from '../../messages/es/nav.json';
import esShop from '../../messages/es/shop.json';
import esAuth from '../../messages/es/auth.json';
import esAdmin from '../../messages/es/admin.json';
import esLegal from '../../messages/es/legal.json';

type Messages = typeof esNav &
  typeof esShop &
  typeof esAuth &
  typeof esAdmin &
  typeof esLegal & {
    common: typeof esCommon;
    buylist: typeof esBuylist;
    errors: typeof esErrors;
  };

declare global {
  // Use type safe message keys with `next-intl`
  interface IntlMessages extends Messages {}
}

