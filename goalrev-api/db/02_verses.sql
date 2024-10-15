
DROP TABLE IF EXISTS public.verses;
CREATE TABLE public.verses (
    verse_number INT NOT NULL PRIMARY KEY,
    verse_timestamp int8 NOT NULL,
    timezone_idx INT NOT NULL,
    root VARCHAR(255) DEFAULT '0',
    FOREIGN KEY (timezone_idx) REFERENCES public.timezones(timezone_idx)
);

INSERT INTO public.verses (verse_number, verse_timestamp, timezone_idx, root) 
VALUES 
    (1, 1728257400, 23, '0'); 