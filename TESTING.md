# TESTING.md

Ta dokument opisuje, kaj je potrebno testirati in kako to izvesti v projektu. Uporabite spodnji kontrolni seznam z označevalnimi polji, da sistematično preverite celoten obseg funkcionalnosti, dostopnosti in robnih primerov.

Kontrolni seznam – Logika igre (utils)
- [ ] Premiki figur: kmet, trdnjava (rook), skakač (knight), tekač (bishop), dama (queen), kralj (king)
- [ ] Preverjanje zakonitosti: poteze, ki puščajo lastnega kralja v šahu, se morajo zavrniti (self-check filter)
- [ ] Končni položaji: mat, pat, brez zakonitih potez (hasAnyLegalMoves, isCheckmate, isStalemate)
- [ ] Rošada: vsi pogoji, prepovedi in simetrija za belo/črno; rošada ne sme iti skozi/končati v šahu
- [ ] En passant: pogoji, odstranitev pravilnega kmeta pri simulaciji (isMoveLegal), veljavnost samo v naslednji potezi
- [ ] SAN (Standardna algebraična notacija): rošada (O-O, O-O-O), zajemi (x), razločevanje (disambiguation), šah (+), mat (#), promocija (e8=Q, exd8=Q)

Kontrolni seznam – Stanje igre in kljuka (hooks/useChessGame)
- [ ] MAKE_MOVE: posodobitev plošče, zamenjava igralca, zabeležka poteze s SAN, status igre
- [ ] UNDO_MOVE/REDO_MOVE: pravilno obnavljanje stanja (vključno z rošado, en passant, promocijo), obnova hasMoved in enPassantTarget
- [ ] Pravice rošade: pravilno se izklopijo ob premiku kralja/roka in ob zajetju vogalnega roka; ob UNDO se povrnejo
- [ ] En passant življenjski cikel: nastavitev tarče po dvojnem koraku, uporaba ali potek po enem pogledu
- [ ] Promocija: pendingPromotion nastavitev ob dosegu zadnje vrste, dokončanje s COMPLETE_PROMOTION, preklic s CANCEL_PROMOTION

Kontrolni seznam – UI komponente
ChessBoard
- [ ] Pravilno izriše 8×8 polja, oznake vrstic/stolpcev, vizualne poudarke izbranega polja in veljavnih potez
- [ ] Dostopnost: role=group za ploščo, polja role=button z jasnimi imeni (npr. "e2 bel kmet", "e4 prazno")
- [ ] A11y test (jest-axe): brez kršitev

ChessSquare / ChessPiece (povleci-in-spusti)
- [ ] Veljavna poteza preko DnD sproži onPieceDrop in premakne figuro
- [ ] Neveljaven primeri: spust na isti kvadrat, spust izven plošče, neveljavna/poškodovana drag data ne spremeni stanja
- [ ] Vizualni poudarki na drag-over in njihovo čiščenje po spustu

GameControls
- [ ] Prikaz trenutnega stanja igre (aktivno/šah/mat/pat)
- [ ] Gumba Undo/Redo sta pravilno omogočena/onemogočena in delujeta z miško in tipkovnico
- [ ] Zgodovina potez prikazuje SAN in informacijo from→to

ConfirmationDialog
- [ ] Odpre se ob resetu; potrditev/preklic deluje; tipka Escape zapre
- [ ] Fokus se ob odprtju smiselno postavi; jest-axe: brez kršitev

PromotionDialog
- [ ] Odpre se ob promociji kmeta; izbira med dama/roka/tekač/skakač; privzeta izbira je dama
- [ ] Tipkovnica: Smerne tipke spreminjajo izbor; Enter/Space potrdi; Escape prekliče
- [ ] Past za fokus (focus trap): Tab/Shift+Tab kroži znotraj dialoga; ob zaprtju se fokus vrne na prej fokusiran element
- [ ] SAN se pravilno zapiše (e8=Q, exd8=Q); Undo/Redo povrneta/ponovita promocijo
- [ ] A11y test (jest-axe): brez kršitev

Kontrolni seznam – Interakcije
- [ ] Tipkovnica: Enter/Space za izbor figure in potrditev poteze na ciljnem polju
- [ ] Dotik: tapni-za-izbor, nato tapni-za-potezo (tap-to-select, tap-to-move)
- [ ] Povleci-in-spusti: miška/trackpad – drsenje figure med polji

Kontrolni seznam – Robni primeri
- [ ] Poskus poteze na isti kvadrat (no-op)
- [ ] Neveljaven drag payload (npr. napačen JSON, manjkajoči podatki) se ignorira brez napake
- [ ] Poteze, ki vodijo v self-check, so filtrirane in se ne izvedejo
- [ ] Redo zgodovina se počisti, ko po UNDO izvedemo drugačno novo potezo

Kontrolni seznam – Pokritost in kakovost
- [ ] Pokritost: statements/lines/functions ≥ 80%, branches ≥ 70%
- [ ] Lokalno generirana poročila o pokritosti (tekst, lcov, HTML)
- [ ] CI preteče (lint + testi + coverage); nalaganje na Codecov se izvede le, če je nastavljena skrivnost CODECOV_TOKEN

Izvajanje testov (lokalno)
- [ ] Namesti odvisnosti
- [ ] Zaženi testni paket
- [ ] Preveri pokritost

Primer ukazov
```bash path=null start=null
# Namestitev
npm ci

# Hiter delni zagon (unit + hook jedro)
npm run test:quick

# Celoten paket
npm test -- --run

# Pokritost (tekst + lcov + HTML)
npm run test:coverage -- --run
# HTML poročilo: coverage/index.html
```

Smernice za nove teste
- [ ] Testi naj bodo samostojni, berljivi in zgovorno poimenovani
- [ ] UI testi: uporabljajte @testing-library/react in user-event; preverjajte A11y z jest-axe, kjer je smiselno
- [ ] Logične enote (utils) pokrivajte z natančnimi primeri, ki zajamejo tipične in robne primere
- [ ] Pri spremembi API/vrst (types) dodajte/posodobite ustrezne teste in ohranite nazaj združljivost, kjer je mogoče

CI in kakovostna vrata
- [ ] GitHub Actions: workflow "CI" (lint, testi s pokritostjo, nalaganje poročil)
- [ ] Codecov: naloži lcov (potreben CODECOV_TOKEN); zna biti izpuščeno pri PR-jih brez skrivnosti
- [ ] Pred združitvijo PR naj bo CI zelen; pregledi naj bodo obravnavani

Pred-commit kljuke (Husky)
- [ ] Pre-commit poganja lint in hiter nabor testov; če kljuke niso nameščene lokalno, zaženite: npm run prepare

Opombe
- Ta kontrolni seznam se nanaša na trenutni obseg funkcionalnosti: pravila šaha (vključno z rošado, en passant), končni položaji, SAN, UI za poteze, dialogi (reset in promocija), interakcije (miška, tipkovnica, dotik) in dostopnost. Pri razširitvah (npr. AI, večigralstvo) razširite tudi testni kontrolni seznam.

