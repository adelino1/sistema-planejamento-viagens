-- database/mock_data.sql
USE tripnomad;

-- Clear tables before inserting to avoid duplicates during dev
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE destinations;
TRUNCATE TABLE countries;
TRUNCATE TABLE continents;
SET FOREIGN_KEY_CHECKS = 1;

-- Continents
INSERT INTO continents (id, name) VALUES 
(1, 'África'), (2, 'Europa'), (3, 'Ásia'), (4, 'América do Norte'), (5, 'América do Sul'), (6, 'Oceania');

-- Countries (Africa)
INSERT INTO countries (id, continent_id, name, code) VALUES
(1, 1, 'Egito', 'EG'), (2, 1, 'Zâmbia', 'ZM'), (3, 1, 'África do Sul', 'ZA'), (4, 1, 'Tanzânia', 'TZ'),
(5, 1, 'Marrocos', 'MA'), (6, 1, 'Angola', 'AO'), (7, 1, 'Cabo Verde', 'CV'), (8, 1, 'Quénia', 'KE');

-- Countries (Europe)
INSERT INTO countries (id, continent_id, name, code) VALUES
(9, 2, 'França', 'FR'), (10, 2, 'Itália', 'IT'), (11, 2, 'Grécia', 'GR'), (12, 2, 'Reino Unido', 'GB'),
(13, 2, 'Espanha', 'ES'), (14, 2, 'Portugal', 'PT'), (15, 2, 'Países Baixos', 'NL'), (16, 2, 'Suíça', 'CH');

-- Countries (Asia)
INSERT INTO countries (id, continent_id, name, code) VALUES
(17, 3, 'China', 'CN'), (18, 3, 'Índia', 'IN'), (19, 3, 'Indonésia', 'ID'), (20, 3, 'EAU', 'AE'),
(21, 3, 'Maldivas', 'MV'), (22, 3, 'Japão', 'JP'), (23, 3, 'Coreia do Sul', 'KR'), (24, 3, 'Tailândia', 'TH');

-- Countries (Americas)
INSERT INTO countries (id, continent_id, name, code) VALUES
(25, 4, 'EUA', 'US'), (26, 4, 'Canadá', 'CA'), (27, 4, 'México', 'MX'), (28, 4, 'Cuba', 'CU'),
(29, 5, 'Brasil', 'BR'), (30, 5, 'Peru', 'PE'), (31, 5, 'Bolívia', 'BO'), (32, 5, 'Argentina', 'AR');

-- Countries (Oceania)
INSERT INTO countries (id, continent_id, name, code) VALUES
(33, 6, 'Austrália', 'AU'), (34, 6, 'Nova Zelândia', 'NZ'), (35, 6, 'Polinésia Francesa', 'PF');

-- Destinations (Sample for each)
INSERT INTO destinations (country_id, name, description, average_cost, local_currency, local_language, cover_image) VALUES
-- Africa
(1, 'Pirâmides de Gizé', 'As misteriosas pirâmides do Egito antigo.', 1200, 'Libra Egípcia (EGP)', 'Árabe', 'https://images.unsplash.com/photo-1539667468225-eebb663053e6?w=800'),
(3, 'Table Mountain', 'Montanha icónica com vista para a Cidade do Cabo.', 1500, 'ZAR', 'Inglês/Afrikaans', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'),
(6, 'Luanda e Mussulo', 'A vibrante capital de Angola e suas praias.', 2000, 'AOA', 'Português', 'https://images.unsplash.com/photo-1614531341130-33635b719018?w=800'),
-- Europe
(9, 'Paris', 'A Cidade Luz. Torre Eiffel, Louvre e croissants.', 2500, 'EUR', 'Francês', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800'),
(10, 'Roma', 'Coliseu, história e a melhor massa do mundo.', 2200, 'EUR', 'Italiano', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800'),
(14, 'Lisboa', 'Cidade das sete colinas, fado e pastéis de Belém.', 1500, 'EUR', 'Português', 'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=800'),
-- Asia
(19, 'Bali', 'Ilha dos deuses, paraíso tropical.', 1800, 'IDR', 'Indonésio', 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800'),
(22, 'Tóquio', 'Onde o tradicional encontra o ultra-moderno.', 3500, 'JPY', 'Japonês', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800'),
-- Americas
(25, 'Nova Iorque', 'A cidade que nunca dorme.', 3000, 'USD', 'Inglês', 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=800'),
(29, 'Rio de Janeiro', 'Cristo Redentor, Pão de Açúcar e Copacabana.', 1200, 'BRL', 'Português', 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800'),
-- Oceania
(33, 'Sydney', 'A espetacular Opera House.', 4000, 'AUD', 'Inglês', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800');
