# Evlz 2019 CTF - Chinese Whisper Write-Up (Crypto)
<!--Authors: SoulTaku-->

```
BOSS: It better be secure!!!

Ciphertext https://storage.cloud.google.com/evlzctf2019/Ciphertext.txt

readme https://storage.cloud.google.com/evlzctf2019/Readme.txt

xuts https://storage.cloud.google.com/evlzctf2019/xuts.txt
```

Reading through the provided files we see that the key for each message is the key for the last message with the last byte changed and shifted. We are also provided with the key for the 40000 message. With some python magic we can write a simple solver for this that generates a previous key based on the given one until the plaintext is readable and do this for all the messages.
After a bit of playing with the ciphertext we observe that it is encrypted using mode ECB so now the only thing left is to write the script:

```python
#!/usr/bin/python
import string
from Crypto.Util.number import *
from Crypto.Cipher import AES


def shift(k):
    return k[-2:] + k[:-2]


def gen_keys(k):
    k = shift(hex(bytes_to_long(k))[2:])[:-2]
    for i in range(256):
        yield long_to_bytes(int(k + hex(i)[2:].zfill(2), 16))


def pad(m):
    while len(m) % 16 != 0:
        m = b'\x00' + m
    return m



msgs    = open('Ciphertext.txt', 'r').read().split()
msgs    = [long_to_bytes(int(i, 16)) for i in msgs]
msg_pos = 399998 # 0
key = b'RC=|H&.\\I~C]XD-6' # b'oRe_ThAn_4_LaK M'

while msg_pos >= 0:
    old = msg_pos
    for k in gen_keys(key):
        aes = AES.new(k, AES.MODE_ECB)
        try:
            m = aes.decrypt(msgs[msg_pos])
        except ValueError:
            m = aes.decrypt(pad(msgs[msg_pos]))

        if msg_pos == 0:
            try:
                print(f'{m.decode()}')
                print(f'{k.decode()}')
                msg_pos -= 1
            except:
                pass

        if all([i in (string.printable.encode() + b'\xe2\x80\xb9') for i in m]): #[:(len(m)*4)//5]]):
            key = k
            print(f'{msg_pos} {m.decode():<50} {k}')
            msg_pos -= 1
            break
    if msg_pos == old:
        print(f'Error on {old}')
        msg_pos += 1
input()
```