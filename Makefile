MODULE = ./node_modules/
SRC_DIR = ./srcs/
_END		=	\x1b[0m
_BOLD		=	\x1b[1m
_UNDER		=	\x1b[4m
_REV		=	\x1b[7m
_GREY		=	\x1b[30m
_RED		=	\x1b[31m
_GREEN		=	\x1b[32m
_YELLOW		=	\x1b[33m
_BLUE		=	\x1b[34m
_PURPLE		=	\x1b[35m
_CYAN		=	\x1b[36m
_WHITE		=	\x1b[37m
_IGREY		=	\x1b[40m
_IRED		=	\x1b[41m
_IGREEN		=	\x1b[42m
_IYELLOW	=	\x1b[43m
_IBLUE		=	\x1b[44m
_IPURPLE	=	\x1b[45m
_ICYAN		=	\x1b[46m
_IWHITE		=	\x1b[47m
_MAGENTA	=	\x1b[35m
all: taskmaster
daemon:
	@test -d $(MODULE) || npm i
	@printf "$(_RED)Daemon executé$(_END)\n"
	@node $(SRC_DIR)daemon/taskmaster_daemon.js

taskmaster:
	@test -d $(MODULE) || npm i
	@printf "$(_RED)taskmaster executé$(_END)\n"
	@node $(SRC_DIR)ctl/taskmaster_ctl.js
fclean:
	@rm -rf $(MODULE)
	@printf "$(_RED)Node modules deleted.$(_END)\n"
