import type { Schema, Struct } from '@strapi/strapi';

export interface MainButtonsMainButtons extends Struct.ComponentSchema {
  collectionName: 'components_main_buttons_main_buttons';
  info: {
    description: '';
    displayName: 'MainButtons';
  };
  attributes: {
    active: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    color: Schema.Attribute.String;
    copyText: Schema.Attribute.String;
    line: Schema.Attribute.Integer;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    svg: Schema.Attribute.Text;
    url: Schema.Attribute.String;
  };
}

export interface ProductContentsProductContents extends Struct.ComponentSchema {
  collectionName: 'components_product_contents_product_contents';
  info: {
    displayName: 'ProductContents';
  };
  attributes: {
    line: Schema.Attribute.Integer;
    name: Schema.Attribute.String;
  };
}

export interface ThemeColorsThemeColors extends Struct.ComponentSchema {
  collectionName: 'components_theme_colors_theme_colors';
  info: {
    description: '';
    displayName: 'ThemeColors';
  };
  attributes: {
    primaryColor: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }> &
      Schema.Attribute.DefaultTo<'1e5cce'>;
    productModalColor: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }> &
      Schema.Attribute.DefaultTo<'7BB4FE'>;
    secondaryColor: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }> &
      Schema.Attribute.DefaultTo<'FFF'>;
    settingColor: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 20;
      }> &
      Schema.Attribute.DefaultTo<'f97316'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'main-buttons.main-buttons': MainButtonsMainButtons;
      'product-contents.product-contents': ProductContentsProductContents;
      'theme-colors.theme-colors': ThemeColorsThemeColors;
    }
  }
}
