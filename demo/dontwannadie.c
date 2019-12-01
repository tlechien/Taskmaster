/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   dontwannadie.c                                     :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: tlechien <tlechien@student.s19.be>         +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2019/11/28 13:49:13 by tlechien          #+#    #+#             */
/*   Updated: 2019/11/28 14:17:22 by tlechien         ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

#include <signal.h>
#include <unistd.h>
void s_handler(int code)
{
	signal(SIGINT, s_handler);
}

int main(void){
	signal(SIGINT, s_handler);

	while(1){
		sleep(10);
		write(1, "slt les amis", 10);
	};
	return 0;
}
