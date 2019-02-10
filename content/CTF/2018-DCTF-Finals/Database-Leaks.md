# Database Leaks Write-Up
<!--Authors: Googal-->
Connecting to dbleaks.dctf18-finals.def.camp:13021 we get:

1)User info:
[3, 'ANA', '4baefe6e504e8866c0d2bc3956f372e2', 'Y2']

We can deduce that 3 is the index in the table, 'ANA' is the user's name '4baefe6e504e8866c0d2bc3956f372e2'is the MD5 of the 
password and 'Y2' is the salt.

2)Ads:
[34, 'You can buy any 3 products with a 26% discount by next month at AwesomeMAG.', '2/28'],

The ads seem random and useless at first, but we notice that the first number, 34, is the id of the user the ad was sent 
to and '13/3' is the date when it was sent(MM/DD).

Eventually, we saw that there are exactly 50 ads(and 50 users) of the following type:
[6, 'Happy Birthday, you can buy any product with a 16% discount today at AwesomeMAG', '02/18']
Therefore, we now have the date of birth for every user.
We also have the gender of each user from their names.(One can use a database to determine each gender, but since we only
needed 20% of the passwords we assumed that every user whose name is ending in 'A' is a female and the others were males.)

A CNP has the following format:

SYYMMDDJJNNNC

where 	S depends on the gender
      	YY are the last 2 digits of the year of birth
	MM, DD are the month and day of birth
	JJ is the county where the user was born
	NNN is a random number
	C is based on the other 12 digits
For more information check https://ro.wikipedia.org/wiki/Cod_numeric_personal

We bruteforced the missing data  in a script in python and noticed that the script gave us almost all passwords, but took far 
too long to find them.
In order to solve that problem, we wrote another code in C++ that matched the bruteforced hash with the given one and gave the 
answer to the python script to validate it.

