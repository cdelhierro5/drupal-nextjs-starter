<?php

namespace Drupal\nextjs_graphql_api\Wrappers;

use Drupal\Core\Entity\EntityInterface;

/**
 * Wraps a paginated list of article nodes.
 *
 * GraphQL resolvers receive this object and extract items/total/hasMore
 * via dedicated data producers, keeping resolver logic clean.
 */
class ArticleConnection {

  /**
   * @param EntityInterface[] $nodes
   */
  public function __construct(
    private readonly array $nodes,
    private readonly int $total,
    private readonly int $limit,
    private readonly int $offset,
  ) {}

  /**
   * @return EntityInterface[]
   */
  public function getNodes(): array {
    return $this->nodes;
  }

  public function getTotal(): int {
    return $this->total;
  }

  public function hasMore(): bool {
    return ($this->offset + $this->limit) < $this->total;
  }

}
