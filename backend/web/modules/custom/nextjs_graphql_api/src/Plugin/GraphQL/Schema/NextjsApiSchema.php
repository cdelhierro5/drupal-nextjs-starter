<?php

namespace Drupal\nextjs_graphql_api\Plugin\GraphQL\Schema;

use Drupal\graphql\Plugin\GraphQL\Schema\SdlSchemaPluginBase;

/**
 * Base GraphQL schema for the Next.js API.
 *
 * This plugin registers the schema that the SchemaExtension attaches to.
 * Enable it at Admin → Configuration → GraphQL → Servers → Add server,
 * then select "Next.js API" as the schema.
 *
 * @Schema(
 *   id = "nextjs_api",
 *   name = "Next.js API",
 *   description = "GraphQL schema for headless Next.js frontend consumption."
 * )
 */
class NextjsApiSchema extends SdlSchemaPluginBase {

  /**
   * {@inheritdoc}
   *
   * Returns the path to the SDL schema file.
   * The graphql module reads this and merges all registered extensions.
   */
  public function getSchemaDefinition(): string {
    // SDL file is at the module root.
    $module_path = \Drupal::service('extension.list.module')
      ->getPath('nextjs_graphql_api');

    return file_get_contents(
      DRUPAL_ROOT . '/' . $module_path . '/nextjs_graphql_api.graphqls'
    );
  }

}
