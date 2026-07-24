@HU-002 @shopping
Feature: HU-002 Gestión del carrito de compras
    Como usuario de Sauce Demo
    Quiero poder agregar y gestionar productos en mi carrito
    Para preparar mi compra

    Background:
        Given el usuario está en la página de login
        When el usuario ingresa credenciales válidas de usuario estándar
        And el usuario está en la página de productos

    @ES-004 @smoke @happy_path
    Scenario: ES-004 Agregar un producto al carrito
        When el usuario agrega el producto "Sauce Labs Backpack" al carrito
        Then el contador del carrito debería mostrar 1
        And el botón del producto debería cambiar a "Remove"

    @ES-005 @happy_path
    Scenario: ES-005 Agregar múltiples productos al carrito
        When el usuario agrega el producto "Sauce Labs Backpack" al carrito
        And el usuario agrega el producto "Sauce Labs Bike Light" al carrito
        Then el contador del carrito debería mostrar 2
        When el usuario navega al carrito
        Then el producto "Sauce Labs Backpack" debería estar visible en el carrito
        And el producto "Sauce Labs Bike Light" debería estar visible en el carrito

    @ES-006 @happy_path
    Scenario: ES-006 Ver productos en el carrito
        When el usuario agrega el producto "Sauce Labs Backpack" al carrito
        And el usuario navega al carrito
        Then el producto "Sauce Labs Backpack" debería estar visible en el carrito
        And el título de la página debería ser "Your Cart"

    @ES-007 @happy_path
    Scenario: ES-007 Remover producto del carrito
        When el usuario agrega el producto "Sauce Labs Backpack" al carrito
        And el usuario navega al carrito
        And el usuario remueve el producto "Sauce Labs Backpack" del carrito
        Then el carrito debería estar vacío
        And el contador del carrito no debería ser visible

    @ES-008 @happy_path
    Scenario: ES-008 Continuar comprando desde el carrito
        When el usuario agrega el producto "Sauce Labs Backpack" al carrito
        And el usuario navega al carrito
        And el usuario hace click en "Continue Shopping"
        Then el usuario debería ver la página de productos