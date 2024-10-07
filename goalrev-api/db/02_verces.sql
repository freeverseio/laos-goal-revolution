
DROP TABLE IF EXISTS public.verses;
CREATE TABLE public.verses (
    verse_id SERIAL PRIMARY KEY,
    verse_number INT NOT NULL,
    verse_timestamp TIMESTAMP NOT NULL,
    timezone_idx INT NOT NULL,
    root VARCHAR(255) DEFAULT '0',
    PRIMARY KEY (verse_id),
    FOREIGN KEY (timezone_idx) REFERENCES public.timezones(timezone_idx)
);

INSERT INTO public.verses (verse_number, verse_timestamp, timezone_idx) VALUES (0, '2024-05-10 18:00:00', 10);