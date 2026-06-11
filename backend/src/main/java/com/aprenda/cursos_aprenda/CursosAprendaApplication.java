package com.aprenda.cursos_aprenda;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.aprenda.cursos_aprenda.repositories")
public class CursosAprendaApplication {

	public static void main(String[] args) {
		SpringApplication.run(CursosAprendaApplication.class, args);
	}

}
