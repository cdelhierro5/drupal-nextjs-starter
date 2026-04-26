<?php

namespace Drupal\nextjs_graphql_api\Plugin\GraphQL\SchemaExtension;

use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\graphql\Plugin\GraphQL\SchemaExtension\SdlSchemaExtensionPluginBase;
use Drupal\nextjs_graphql_api\Wrappers\ArticleConnection;

/**
 * Schema extension: registers all field resolvers for the Next.js API.
 *
 * @SchemaExtension(
 *   id = "nextjs_graphql_api_extension",
 *   name = "Next.js GraphQL API Extension",
 *   description = "Resolvers for Article, Page, Author, MediaImage and Metatag types.",
 *   schema = "nextjs_api"
 * )
 */
class NextjsApiSchemaExtension extends SdlSchemaExtensionPluginBase {

  /**
   * {@inheritdoc}
   */
  public function registerResolvers(ResolverRegistryInterface $registry): void {
    $builder = new ResolverBuilder();

    $this->addQueryResolvers($registry, $builder);
    $this->addArticleResolvers($registry, $builder);
    $this->addPageResolvers($registry, $builder);
    $this->addArticleConnectionResolvers($registry, $builder);
    $this->addAuthorResolvers($registry, $builder);
    $this->addMediaImageResolvers($registry, $builder);
    $this->addTermResolvers($registry, $builder);
    $this->addMetatagResolvers($registry, $builder);
  }

  // ---------------------------------------------------------------------------
  // Query resolvers
  // ---------------------------------------------------------------------------

  private function addQueryResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    // article(path: String!)
    $r->addFieldResolver('Query', 'article',
      $b->produce('route_load')->map('path', $b->fromArgument('path'))
        ->map('then', $b->produce('route_entity')->map('url', $b->fromParent()))
    );

    // articles(limit, offset)
    $r->addFieldResolver('Query', 'articles',
      $b->produce('query_articles')
        ->map('limit',  $b->fromArgument('limit'))
        ->map('offset', $b->fromArgument('offset'))
    );

    // page(path: String!)
    $r->addFieldResolver('Query', 'page',
      $b->produce('route_load')->map('path', $b->fromArgument('path'))
        ->map('then', $b->produce('route_entity')->map('url', $b->fromParent()))
    );
  }

  // ---------------------------------------------------------------------------
  // Article field resolvers
  // ---------------------------------------------------------------------------

  private function addArticleResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('Article', 'id',
      $b->produce('entity_id')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Article', 'title',
      $b->produce('entity_label')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Article', 'path',
      $b->compose(
        $b->produce('entity_url')->map('entity', $b->fromParent()),
        $b->produce('url_path')->map('url', $b->fromParent())
      )
    );

    $r->addFieldResolver('Article', 'summary',
      $b->produce('property_path')
        ->map('type', $b->fromValue('entity:node'))
        ->map('value', $b->fromParent())
        ->map('path', $b->fromValue('body.summary'))
    );

    $r->addFieldResolver('Article', 'body',
      $b->produce('property_path')
        ->map('type', $b->fromValue('entity:node'))
        ->map('value', $b->fromParent())
        ->map('path', $b->fromValue('body.processed'))
    );

    $r->addFieldResolver('Article', 'publishedAt',
      $b->produce('entity_created')
        ->map('entity', $b->fromParent())
        ->map('format', $b->fromValue('c'))
    );

    $r->addFieldResolver('Article', 'updatedAt',
      $b->produce('entity_changed')
        ->map('entity', $b->fromParent())
        ->map('format', $b->fromValue('c'))
    );

    $r->addFieldResolver('Article', 'author',
      $b->produce('entity_owner')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Article', 'image',
      $b->produce('property_path')
        ->map('type', $b->fromValue('entity:node'))
        ->map('value', $b->fromParent())
        ->map('path', $b->fromValue('field_image.entity'))
    );

    $r->addFieldResolver('Article', 'tags',
      $b->produce('entity_reference')
        ->map('entity', $b->fromParent())
        ->map('field', $b->fromValue('field_tags'))
    );

    $r->addFieldResolver('Article', 'metatags',
      $b->produce('metatags')->map('entity', $b->fromParent())
    );
  }

  // ---------------------------------------------------------------------------
  // Page field resolvers
  // ---------------------------------------------------------------------------

  private function addPageResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('Page', 'id',
      $b->produce('entity_id')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Page', 'title',
      $b->produce('entity_label')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Page', 'path',
      $b->compose(
        $b->produce('entity_url')->map('entity', $b->fromParent()),
        $b->produce('url_path')->map('url', $b->fromParent())
      )
    );

    $r->addFieldResolver('Page', 'body',
      $b->produce('property_path')
        ->map('type', $b->fromValue('entity:node'))
        ->map('value', $b->fromParent())
        ->map('path', $b->fromValue('body.processed'))
    );

    $r->addFieldResolver('Page', 'metatags',
      $b->produce('metatags')->map('entity', $b->fromParent())
    );
  }

  // ---------------------------------------------------------------------------
  // ArticleConnection resolvers
  // ---------------------------------------------------------------------------

  private function addArticleConnectionResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('ArticleConnection', 'items',
      $b->produce('connection_nodes')->map('connection', $b->fromParent())
    );

    $r->addFieldResolver('ArticleConnection', 'total',
      $b->produce('connection_total')->map('connection', $b->fromParent())
    );

    $r->addFieldResolver('ArticleConnection', 'hasMore',
      $b->produce('connection_has_more')->map('connection', $b->fromParent())
    );
  }

  // ---------------------------------------------------------------------------
  // Author resolvers
  // ---------------------------------------------------------------------------

  private function addAuthorResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('Author', 'name',
      $b->produce('entity_label')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Author', 'picture',
      $b->produce('property_path')
        ->map('type', $b->fromValue('entity:user'))
        ->map('value', $b->fromParent())
        ->map('path', $b->fromValue('user_picture.entity'))
    );
  }

  // ---------------------------------------------------------------------------
  // MediaImage resolvers
  // ---------------------------------------------------------------------------

  private function addMediaImageResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('MediaImage', 'url',
      $b->produce('image_url')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('MediaImage', 'alt',
      $b->produce('property_path')
        ->map('type', $b->fromValue('entity:file'))
        ->map('value', $b->fromParent())
        ->map('path', $b->fromValue('field_image.alt'))
    );
  }

  // ---------------------------------------------------------------------------
  // Term resolvers
  // ---------------------------------------------------------------------------

  private function addTermResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('Term', 'id',
      $b->produce('entity_id')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Term', 'name',
      $b->produce('entity_label')->map('entity', $b->fromParent())
    );

    $r->addFieldResolver('Term', 'path',
      $b->compose(
        $b->produce('entity_url')->map('entity', $b->fromParent()),
        $b->produce('url_path')->map('url', $b->fromParent())
      )
    );
  }

  // ---------------------------------------------------------------------------
  // Metatag resolvers
  // ---------------------------------------------------------------------------

  private function addMetatagResolvers(ResolverRegistryInterface $r, ResolverBuilder $b): void {
    $r->addFieldResolver('Metatag', 'name',
      $b->produce('metatag_name')->map('metatag', $b->fromParent())
    );

    $r->addFieldResolver('Metatag', 'content',
      $b->produce('metatag_content')->map('metatag', $b->fromParent())
    );
  }

}
