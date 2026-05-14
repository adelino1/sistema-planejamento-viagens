<?php
declare(strict_types=1);

/**
 * Excepção de domínio/HTTP mapeada para resposta JSON pelo front controller.
 * Os serviços devem lançar esta classe em vez de chamar exit() ou errorResponse().
 */
final class HttpException extends Exception
{
    /**
     * @param array<int|string, string> $errors
     */
    public function __construct(
        string $message = '',
        public readonly int $statusCode = 400,
        public readonly array $errors = [],
        int $code = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, $code, $previous);
    }
}
