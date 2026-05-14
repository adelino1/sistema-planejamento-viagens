<?php
declare(strict_types=1);

/**
 * @param array<int, array<string, mixed>> $routes
 */
function matchRoute(string $routePattern, string $requestPath): ?array
{
    $patternParts = explode('/', trim($routePattern, '/'));
    $pathParts = explode('/', trim($requestPath, '/'));

    if ($patternParts === [''] && $pathParts === ['']) {
        return [];
    }

    if (count($patternParts) !== count($pathParts)) {
        return null;
    }

    $params = [];
    foreach ($patternParts as $index => $part) {
        $pathPart = $pathParts[$index];

        if (preg_match('/^\{([a-zA-Z_][a-zA-Z0-9_]*)\}$/', $part, $matches) === 1) {
            $params[$matches[1]] = $pathPart;
            continue;
        }

        if ($part !== $pathPart) {
            return null;
        }
    }

    return $params;
}

function dispatchController(object $controller, string $action, string $method, array $body, array $params): void
{
    if (in_array($method, ['POST', 'PUT', 'PATCH'], true)) {
        if ($params === []) {
            $controller->$action($body);
            return;
        }

        $controller->$action($body, $params);
        return;
    }

    if ($params === []) {
        $controller->$action();
        return;
    }

    $controller->$action($params);
}
