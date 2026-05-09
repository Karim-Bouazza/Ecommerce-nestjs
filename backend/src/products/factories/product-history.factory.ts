import { Injectable } from '@nestjs/common';

import { Product } from '../entities/product.entity';

import { ProductHistory } from '../entities/product-history.entity';

import { User } from '../../users/entities/user.entity';

@Injectable()
export class ProductHistoryFactory {
  create(
    oldProduct: Product,
    newProduct: Product,
    user?: User,
  ): ProductHistory {
    const history = new ProductHistory();

    history.product = newProduct;

    history.user = user ?? null;

    history.codeBarreOld = oldProduct.codeBarre;

    history.codeBarreNew = newProduct.codeBarre;

    history.refOld = oldProduct.ref;
    history.refNew = newProduct.ref;

    history.nameOld = oldProduct.name;
    history.nameNew = newProduct.name;

    history.stockIniOld = oldProduct.stockIni;

    history.stockIniNew = newProduct.stockIni;

    history.pv1HtOld = oldProduct.pv1Ht;

    history.pv1HtNew = newProduct.pv1Ht;

    history.pv2HtOld = oldProduct.pv2Ht;

    history.pv2HtNew = newProduct.pv2Ht;

    history.pv3HtOld = oldProduct.pv3Ht;

    history.pv3HtNew = newProduct.pv3Ht;

    return history;
  }
}
